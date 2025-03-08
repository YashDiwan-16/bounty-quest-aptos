import { TwitterApi } from "twitter-api-v2";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/clientpromise";
import { adaptTwitterResponse } from "@/lib/adapters";
import { TwitterApiTweet } from "@/lib/types";

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
});

async function fetchTweetData(tweetId: string) {
  try {
    const tweet = await twitterClient.v2.singleTweet(tweetId, {
      expansions: ["author_id"],
      "tweet.fields": ["created_at", "public_metrics", "text"],
      "user.fields": ["name", "username", "profile_image_url"],
    });
    return tweet;
  } catch (error) {
    console.error("Error fetching tweet:", error);
    throw error;
  }
}

async function checkExistingVerification(publicKey: string) {
  const client = await clientPromise;
  const db = client.db("tweetcontest");

  const existingUser = await db.collection("users").findOne({
    publicKey: publicKey,
  });

  return existingUser;
}

export async function POST(req: Request) {
  try {
    const { tweetUrl, publicKey } = await req.json();

    // Check if user is already verified
    const existingVerification = await checkExistingVerification(publicKey);
    if (existingVerification) {
      return NextResponse.json(
        { error: "This wallet is already verified" },
        { status: 400 }
      );
    }

    const tweetId = tweetUrl.split("/status/")[1]?.split("?")[0];
    if (!tweetId) {
      return NextResponse.json(
        { error: "Invalid Twitter URL" },
        { status: 400 }
      );
    }

    const tweetData = await fetchTweetData(tweetId);
    if (!tweetData || !tweetData.data) {
      throw new Error("Failed to fetch valid tweet data");
    }

    const adaptedTweet = adaptTwitterResponse(tweetData as TwitterApiTweet);

    console.log("Adapted tweet:", adaptedTweet.text);
    console.log("Public key:", adaptedTweet.text.includes(publicKey));

    // Verify public key exists in tweet text
    if (!adaptedTweet.text.includes(publicKey)) {
      return NextResponse.json(
        { error: "Public key not found in tweet" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("tweetcontest");

    // Store user data in MongoDB
    await db.collection("users").insertOne({
      publicKey,
      twitterId: tweetId,
      twitterName: adaptedTweet.authorName,
      twitterUsername: adaptedTweet.author,
      profileImageUrl: adaptedTweet.authorImage,
      authorId: adaptedTweet.author_id,
      url: tweetUrl,
      text: adaptedTweet.text,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Wallet verified successfully",
    });
  } catch (error) {
    console.error("Error verifying tweet:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
