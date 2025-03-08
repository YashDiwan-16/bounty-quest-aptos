// services/scoringService.ts
import { ContestEntry, TweetData } from "@/lib/contest";
import { GoogleGenerativeAI } from "@google/generative-ai";
import clientPromise from "@/lib/clientpromise";
import { ObjectId } from "mongodb";

export class ScoringService {
  private static readonly WEIGHTS = {
    RELEVANCE: 0.5, // 50% weight for content relevance
    IMPRESSIONS: 0.2, // 20% weight for impressions
    LIKES: 0.15, // 15% weight for likes
    RETWEETS: 0.1, // 10% weight for retweets
    REPLIES: 0.05, // 5% weight for replies
  };

  private static async evaluateContentRelevance(
    tweetText: string,
    taskDescription: string
  ): Promise<number> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Task Description: "${taskDescription}"
      Tweet Content: "${tweetText}"
      
      Evaluate how relevant this tweet is to the given task on a scale of 0 to 1.
      Consider:
      1. Does the tweet directly address the task?
      2. Does it contain all required elements?
      3. Is it on-topic and focused?
      
      Respond with only a number between 0 and 100, where 100 is perfectly relevant.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseFloat(response.text());
  }

  private static calculateEngagementScore(
    metrics: TweetData["data"]["stats"]
  ): number {
    const normalizedImpressions = Math.min(metrics.impressions / 1000, 1);
    const normalizedLikes = Math.min(metrics.likes / 100, 1);
    const normalizedRetweets = Math.min(metrics.retweets / 50, 1);
    const normalizedReplies = Math.min(metrics.replies / 25, 1);

    return (
      normalizedImpressions * this.WEIGHTS.IMPRESSIONS +
      normalizedLikes * this.WEIGHTS.LIKES +
      normalizedRetweets * this.WEIGHTS.RETWEETS +
      normalizedReplies * this.WEIGHTS.REPLIES
    );
  }

  public static async evaluateEntry(
    tweetData: TweetData,
    taskId: string
  ): Promise<ContestEntry> {
    const client = await clientPromise;
    const db = client.db("tweetcontest");

    const task = await db
      .collection("tasks")
      .findOne({ _id: new ObjectId(taskId) });
    if (!task) throw new Error("Task not found");

    // Calculate scores
    const contentRelevanceScore = await this.evaluateContentRelevance(
      tweetData.data.text,
      task.description
    );

    const engagementScore = this.calculateEngagementScore(tweetData.data.stats);

    // Calculate total score
    const totalScore =
      contentRelevanceScore * this.WEIGHTS.RELEVANCE +
      engagementScore * (1 - this.WEIGHTS.RELEVANCE);

    const entry: ContestEntry = {
      tweetId: tweetData.data.id,
      author: tweetData.data.author,
      authorName: tweetData.data.authorName,
      text: tweetData.data.text,
      taskId,
      contentRelevanceScore,
      engagementScore,
      totalScore,
      metrics: tweetData.data.stats,
      evaluated: true,
      createdAt: new Date(tweetData.data.created_at),
    };

    // Store entry in MongoDB
    await db.collection("entries").insertOne(entry);

    return entry;
  }

  public static async determineWinners(taskId: object): Promise<void> {
    const client = await clientPromise;
    const db = client.db("tweetcontest");

    const winners = [{ tweetId: "", totalScore: 0 }];
    // get top 3 entries based on total score
    const entries = await db
      .collection("entries")
      .find({ taskId })
      .sort({ totalScore: -1 })
      .limit(3)
      .toArray();

    if (entries.length > 0) {
    }
    // Update task with winners
    await db.collection("tasks").updateOne(
      { _id: taskId },
      {
        $set: {
          winners: winners.map((w) => w.tweetId),
          isActive: false,
        },
      }
    );
  }
}
