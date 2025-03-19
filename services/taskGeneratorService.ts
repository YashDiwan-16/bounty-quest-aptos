// services/taskGeneratorService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import clientPromise from "../lib/clientpromise";
import { ObjectId } from "mongodb";
import TwitterApi from "twitter-api-v2";

export interface GeneratedTask {
  description: string;
  category: "blockchain" | "memes" | "nfts";
  requirements: string[];
  evaluationCriteria: string[];
  rewards?: {
    aptAmount: number;
    nftReward: boolean;
  };
}

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
});

export class TaskGeneratorService {
  private static async generateTaskWithAI(): Promise<GeneratedTask> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Generate a creative Twitter task related to one of these categories: blockchain, memes, or NFTs.
      The task should be engaging, clear, and encourage creative responses.
      Return ONLY a valid JSON object with no additional text, markdown or explanation. It should start with an opening curly brace '{' and end with a closing curly brace '}'.
      The JSON must strictly follow this format:
      {
        "title": "task title",
        "description": "clear task description",
        "category": "one of: blockchain, memes, nfts",
        "requirements": ["list of specific requirements"],
        "evaluationCriteria": ["specific criteria for judging"]
        "rewards": {
          "aptAmount": "any number from 1 to 5",
          "nftReward": true
        }
      }

      Make the task fun and engaging while maintaining relevance to crypto/web3 culture.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  }

  private static async GenerateTweetContent(
    task: GeneratedTask,
    taskId: string
  ) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Helper to escape special characters
    const escapeSpecialChars = (str: string) =>
      str.replace(/[\n\r\t]/g, " ").replace(/"/g, '\\"');

    // Sanitize inputs
    const taskDescription = escapeSpecialChars(task.description);
    const taskRequirements = task.requirements
      .map(escapeSpecialChars)
      .join(", ");
    const taskCriteria = task.evaluationCriteria
      .map(escapeSpecialChars)
      .join(", ");

    // Prompt for AI
    const prompt = `
    You are tasked with creating a tweet to promote a specific task on Bounty Quest. 
    Use the details below to craft a creative, engaging, and persuasive tweet:
  
    1. **Task Description**: ${taskDescription}
    2. **Task Requirements**: ${taskRequirements}
    3. **Evaluation Criteria**: ${taskCriteria}
  
    **Goal**: Encourage users to participate in this task. Include the task link in the tweet:
    https://solana-ai-steel.vercel.app/tasks/${taskId}
  
    **Format Requirements**:
    - The tweet should have proper formatting with line breaks for readability.
    - Use emojis to make the tweet engaging.
    - Include the task link and relevant hashtags like #BountyQuest, #Blockchain, etc.
    - Keep the tweet within the 280 character limit.
  
    Respond with the text of the tweet only. Do not include any additional text, JSON format, or comments.
    `;

    // Get response
    const result = await model.generateContent(prompt);
    const tweetContent = result.response.text().trim();
    return tweetContent;
  }

  public static async createNewTask(durationHours: number = 4) {
    const task = await this.generateTaskWithAI();

    // Ensure task has reward information
    if (!task.rewards) {
      task.rewards = {
        aptAmount: 1.0,
        nftReward: true
      };
    }

    const client = await clientPromise;
    const db = client.db("tweetcontest");

    const startTime = new Date();
    const endTime = new Date(
      startTime.getTime() + durationHours * 60 * 60 * 1000
    );

    const result = await db.collection("tasks").insertOne({
      ...task,
      startTime,
      endTime,
      isActive: true,
      winners: [],
      isWinnerDeclared: false,
      rewardDistributed: false,
      _id: new ObjectId(),
    });
    const tweet = await this.PostTweetofTask(
      task,
      result.insertedId.toString()
    );
    return { taskId: result.insertedId.toString(), tweet };
  }

  public static async getActiveTask() {
    const client = await clientPromise;
    const db = client.db("tweetcontest");
    // if task has ended, set isActive to false
    await this.checkTaskStatus();
    return db.collection("tasks").find({ isActive: true }).toArray();
  }

  public static async PostTweetofTask(task: GeneratedTask, taskId: string) {
    try {
      const tweetContent = await this.GenerateTweetContent(task, taskId);

      const tweet = await twitterClient.readWrite.v2.tweet(tweetContent);
      return tweet;
    } catch (error) {
      return error;
    }
  }

  public static async getActiveTaskById(taskId: string) {
    const client = await clientPromise;
    const db = client.db("tweetcontest");
    return db
      .collection("tasks")
      .findOne({ _id: new ObjectId(taskId), isActive: true });
  }

  public static async getTaskById(taskId: string) {
    const client = await clientPromise;
    const db = client.db("tweetcontest");
    return db.collection("tasks").findOne({ _id: new ObjectId(taskId) });
  }

  public static async setTaskInactive(taskId: string) {
    const client = await clientPromise;
    const db = client.db("tweetcontest");
    return db
      .collection("tasks")
      .updateOne({ _id: new ObjectId(taskId) }, { $set: { isActive: false } });
  }

  public static async getPastTasks() {
    const client = await clientPromise;
    const db = client.db("tweetcontest");
    return db.collection("tasks").find({ isActive: false }).toArray();
  }

  public static async setTaskWinner() {
    let updateCount = 0;
    const client = await clientPromise;
    const db = client.db("tweetcontest");
    const tasks = db.collection("tasks");
    const submission = db.collection("submissions");

    // check if the task isActive is false and isWinnerDeclared is false and endTime should be 2 hours before the current time
    const completedTaskinDeclaredTime = await tasks
      .find({
        isActive: false,
        isWinnerDeclared: false,
        endTime: { $lt: new Date(new Date().getTime() - 2 * 60 * 60 * 1000) },
      })
      .toArray();
    // After task is inactive then evaluate the task as submission collection have the task id and submission score. update the top 3 winners in the task collection winner field array
    const taskIds = completedTaskinDeclaredTime.map((task) => task._id);

    for (const taskId of taskIds) {
      const submissions = await submission
        .find({ taskId: taskId.toString() })
        .sort({ "scores.overall": -1 })
        .limit(3)
        .toArray();
      const winners = submissions.map((submission) => submission.publicKey);
      const updatedWinner = await tasks.updateOne(
        { _id: taskId },
        {
          $set: {
            winners,
            isWinnerDeclared: true,
          },
        }
      );
      if (updatedWinner) {
        updateCount++;
        
        // Trigger reward distribution for the winner if there is one
        if (winners.length > 0) {
          try {
            // This can be done asynchronously or via a queue system
            // For now, we'll just log it
            console.log(`Winner declared for task ${taskId}. Winner: ${winners[0]}`);
            console.log('Rewards should be distributed via the /api/tasks/reward endpoint');
          } catch (error) {
            console.error(`Failed to initiate reward distribution for task ${taskId}:`, error);
          }
        }
      }
    }
    return updateCount;
  }

  // write a method to set the task as inactive if the end time has passed
  public static async checkTaskStatus() {
    const client = await clientPromise;
    const db = client.db("tweetcontest");
    const currentTime = new Date();

    return db
      .collection("tasks")
      .updateMany(
        { endTime: { $lt: currentTime } },
        { $set: { isActive: false } }
      );
  }
}
