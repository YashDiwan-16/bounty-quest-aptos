import { NextResponse } from "next/server";
import { BlockchainRewardService } from "@/services/rewardService";
import clientPromise from "@/lib/clientpromise";
import { ObjectId } from "mongodb";

const API_KEY = process.env.AUTHENTICATION_TOKEN; // Same API key used for other endpoints

/**
 * Endpoint to distribute NFT and APT rewards to task winners.
 * 
 * Request body:
 * {
 *   taskId: string,  // ID of the task
 *   winnerWallet: string,  // Aptos wallet address of the winner
 *   aptAmount: number  // Amount of APT to distribute (optional, defaults to 1.0)
 * }
 * 
 * Response:
 * - 200: Rewards distributed successfully
 * - 400: Invalid request parameters
 * - 401: Unauthorized
 * - 404: Task not found
 * - 409: Rewards already distributed
 * - 500: Server error
 */
export async function POST(request: Request) {
  try {
    // Verify API key
    const apiKey = request.headers.get("Authorization");
    if (apiKey !== `Bearer ${API_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { taskId, winnerWallet, aptAmount = 1.0 } = await request.json();

    // Validate required fields
    if (!taskId || !winnerWallet) {
      return NextResponse.json(
        { error: "taskId and winnerWallet are required" },
        { status: 400 }
      );
    }

    // Fetch task to verify it exists and check if rewards have already been distributed
    const client = await clientPromise;
    const db = client.db("tweetcontest");
    
    const task = await db.collection("tasks").findOne({ 
      _id: new ObjectId(taskId) 
    });

    if (!task) {
      return NextResponse.json(
        { error: `Task with ID ${taskId} not found` },
        { status: 404 }
      );
    }

    if (task.rewardDistributed) {
      return NextResponse.json(
        { error: "Rewards have already been distributed for this task" },
        { status: 409 }
      );
    }

    // Distribute rewards
    const rewardResult = await BlockchainRewardService.distributeRewards(
      winnerWallet,
      taskId,
      aptAmount
    );

    return NextResponse.json({
      message: "Rewards distributed successfully",
      nftTxHash: rewardResult.nftTxHash,
      aptTxHash: rewardResult.aptTxHash
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error distributing rewards:", error);
    
    return NextResponse.json(
      { error: "Failed to distribute rewards", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check if rewards have been distributed for a task.
 * 
 * Query parameters:
 * taskId: string  // ID of the task
 * 
 * Response:
 * - 200: Status of reward distribution
 * - 400: Invalid taskId
 * - 404: Task not found
 * - 500: Server error
 */
export async function GET(request: Request) {
  try {
    // Get taskId from query params
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    // Fetch task
    const client = await clientPromise;
    const db = client.db("tweetcontest");
    
    const task = await db.collection("tasks").findOne({ 
      _id: new ObjectId(taskId) 
    });

    if (!task) {
      return NextResponse.json(
        { error: `Task with ID ${taskId} not found` },
        { status: 404 }
      );
    }

    // Get reward transactions for the task
    const rewards = await db.collection("rewards").find({ 
      taskId 
    }).toArray();

    return NextResponse.json({
      taskId,
      rewardDistributed: task.rewardDistributed || false,
      rewardDistributedAt: task.rewardDistributedAt || null,
      rewards: rewards || []
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error checking reward status:", error);
    
    return NextResponse.json(
      { error: "Failed to check reward status", message: error.message },
      { status: 500 }
    );
  }
} 