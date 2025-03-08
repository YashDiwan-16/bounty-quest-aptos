import { NextResponse } from "next/server";
import clientPromise from "@/lib/clientpromise";

async function checkPublicKeyExists(publicKey: string) {
  const client = await clientPromise;
  const db = client.db("tweetcontest");

  const existingUser = await db.collection("users").findOne({
    publicKey: publicKey,
  });

  return !!existingUser;
}

async function checkTaskSubmission(publicKey: string, taskId: string) {
  const client = await clientPromise;
  const db = client.db("tweetcontest");

  const submission = await db.collection("submissions").findOne({
    publicKey,
    taskId,
  });

  return submission;
}

export async function POST(request: Request) {
  try {
    const { publicKey, taskId } = await request.json();
    if (!publicKey) {
      return NextResponse.json(
        { error: "Public key is required" },
        { status: 400 }
      );
    }

    const exists = await checkPublicKeyExists(publicKey);
    const submitted = await checkTaskSubmission(publicKey, taskId);
    if (!exists) {
      return NextResponse.json({ pagestate: "unauthenticated" });
    }
    if (exists) {
      if (submitted) {
        return NextResponse.json({
          pagestate: "submitted",
          twitterId: submitted.tweetId,
        });
      } else {
        return NextResponse.json({ pagestate: "authenticated" });
      }
    }
  } catch (error) {
    console.error("Error checking verification:", error);
    return NextResponse.json({ error: "Invalid public key" }, { status: 400 });
  }
}
