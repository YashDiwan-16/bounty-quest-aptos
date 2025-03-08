import { TwitterApi } from "twitter-api-v2";
import { NextResponse } from "next/server";
import { adaptTwitterResponse } from "@/lib/adapters";
import { TwitterApiTweet } from "@/lib/types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import clientPromise from "@/lib/clientpromise";
import { Task } from "@/types/challenge";

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

function calculateEngagementScore(metrics: {
  like_count: number;
  retweet_count: number;
  reply_count: number;
  impression_count: number;
}) {
  const { like_count, retweet_count, reply_count, impression_count } = metrics;

  // Normalize engagement metrics
  const engagementRate =
    (like_count + retweet_count + reply_count) / impression_count;
  return Math.min(Math.round(engagementRate * 1000), 100); // Score out of 100
}

async function evaluateTweetContent(tweetText: string, task: Task) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Task Requirements: ${task.requirements.join(", ")}
    Tweet Content: "${tweetText}"
    
    Evaluate if the tweet content is relevant to the task requirements and provide:
    1. Relevance score (0-100)
    2. Content quality score (0-100)
    3. Brief feedback

    IMPORTANT: Return ONLY a raw JSON object. No markdown formatting, no backticks, no extra text.
The response must start with { and end with } and be valid JSON with this structure:
    
    Format response as JSON:
    {
      "relevanceScore": number,
      "contentQuality": number,
      "feedback": "string"
    }
  `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  return JSON.parse(response.text());
}

async function fetchTweetData(tweetId: string) {
  try {
    const tweet = await twitterClient.v2.singleTweet(tweetId, {
      expansions: ["author_id", "attachments.media_keys"],
      "tweet.fields": ["created_at", "public_metrics", "text"],
      "user.fields": ["name", "username", "profile_image_url"],
    });
    return tweet;
  } catch (error) {
    console.error("Error fetching tweet:", error);
    throw error;
  }
}

async function getUser(publicKey: string) {
  const client = await clientPromise;
  const db = client.db("tweetcontest");

  const user = await db.collection("users").findOne({ publicKey: publicKey });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function POST(request: Request) {
  try {
    const { url, taskData, publicKey } = await request.json();

    const tweetId = url.split("/status/")[1]?.split("?")[0];
    if (!tweetId) {
      return NextResponse.json(
        { error: "Invalid Twitter URL" },
        { status: 400 }
      );
    }

    const user = await getUser(publicKey);

    const tweetData = await fetchTweetData(tweetId);
    if (!tweetData || !tweetData.data || !tweetData.data.author_id) {
      throw new Error("Failed to fetch valid tweet data");
    }

    if (tweetData.data.author_id !== user.authorId) {
      return NextResponse.json(
        { error: "Please submit your own tweet URL" },
        { status: 400 }
      );
    }

    const adaptedTweet = adaptTwitterResponse(tweetData as TwitterApiTweet);

    // Calculate engagement score
    const engagementScore = calculateEngagementScore(
      adaptedTweet.public_metrics
    );

    // Evaluate content
    const contentEvaluation = await evaluateTweetContent(
      adaptedTweet.text,
      taskData
    );

    // Calculate overall score
    const overallScore = Math.round(
      (engagementScore +
        contentEvaluation.relevanceScore +
        contentEvaluation.contentQuality) /
        3
    );

    // Store submission in MongoDB
    const client = await clientPromise;
    const db = client.db("tweetcontest");

    const submission = {
      publicKey,
      taskId: taskData._id,
      tweetId: adaptedTweet.id,
      authorId: adaptedTweet.author_id,
      authorUsername: adaptedTweet.author,
      authorName: adaptedTweet.authorName,
      tweetText: adaptedTweet.text,
      scores: {
        relevance: contentEvaluation.relevanceScore,
        engagement: engagementScore,
        contentQuality: contentEvaluation.contentQuality,
        overall: overallScore,
      },
      feedback: contentEvaluation.feedback,
      metrics: adaptedTweet.public_metrics,
      createdAt: new Date(),
      status: "submitted",
    };

    await db.collection("submissions").insertOne(submission);

    return NextResponse.json({
      result: {
        relevanceScore: contentEvaluation.relevanceScore,
        engagementScore,
        contentQuality: contentEvaluation.contentQuality,
        overallScore,
        feedback: contentEvaluation.feedback,
      },
      tweetData: adaptedTweet,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: error || "Failed to fetch tweet data" },
      { status: 500 }
    );
  }
}
