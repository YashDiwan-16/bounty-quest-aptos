import { NextResponse } from "next/server";
import clientPromise from "@/lib/clientpromise";
import { ObjectId } from "mongodb";

/**
 * API endpoint to serve NFT metadata for a specific task
 * 
 * This follows the Metadata Standard format expected by NFT marketplaces.
 * The metadata includes:
 * - name: Name of the NFT
 * - description: Description of the NFT
 * - image: URL to the image associated with the NFT
 * - attributes: Additional properties of the NFT
 * 
 * @param {Request} request - The incoming request
 * @param {Object} params - URL parameters
 * @param {string} params.taskId - The ID of the task
 * @returns {Response} JSON response with NFT metadata
 */
export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Fetch task details from the database
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

    // Generate metadata for the NFT
    const metadata = {
      name: `Bounty Quest Winner: ${task.title || 'Task #' + taskId}`,
      description: `This NFT certifies that the owner is a winner of the Bounty Quest task: ${task.description}`,
      image: `https://bounty-quest-aptos.vercel.app/api/nft/image/${taskId}`, // You'll need to implement this endpoint
      external_url: `https://bounty-quest-aptos.vercel.app/tasks/${taskId}`,
      attributes: [
        {
          trait_type: "Category",
          value: task.category || "General"
        },
        {
          trait_type: "Completion Date",
          value: new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
        },
        {
          trait_type: "Task Type",
          value: "Bounty"
        }
      ]
    };

    // Add custom attributes from task if available
    if (task.requirements && Array.isArray(task.requirements)) {
      metadata.attributes.push({
        trait_type: "Requirements",
        value: task.requirements.length.toString()
      });
    }

    if (task.evaluationCriteria && Array.isArray(task.evaluationCriteria)) {
      metadata.attributes.push({
        trait_type: "Evaluation Criteria",
        value: task.evaluationCriteria.length.toString()
      });
    }

    // Return the metadata as JSON
    return NextResponse.json(metadata);
  } catch (error: any) {
    console.error("Error generating NFT metadata:", error);
    
    return NextResponse.json(
      { error: "Failed to generate NFT metadata", message: error.message },
      { status: 500 }
    );
  }
} 