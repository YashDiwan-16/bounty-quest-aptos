import { NextResponse } from "next/server";
import clientPromise from "@/lib/clientpromise";
import { ObjectId } from "mongodb";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * API endpoint to generate and serve an image for the NFT
 * 
 * This endpoint:
 * 1. Fetches task details from the database
 * 2. Uses Google's Generative AI to create a custom image based on task details
 * 3. Returns the image with proper content type
 * 
 * @param {Request} request - The incoming request
 * @param {Object} params - URL parameters
 * @param {string} params.taskId - The ID of the task
 * @returns {Response} Image response or error
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

    // Check if we have a cached image
    const cachedImage = await db.collection("nft_images").findOne({ taskId });
    
    if (cachedImage && cachedImage.imageData) {
      // Return cached image
      const buffer = Buffer.from(cachedImage.imageData, 'base64');
      return new Response(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
        }
      });
    }

    // For simplicity, we're just using a placeholder image service
    // In production, you should generate a custom image or use IPFS
    
    // Placeholder image approach (simple, but not ideal for production)
    const category = task.category || 'blockchain';
    const placeholderUrl = `https://placehold.co/600x400/1f3a8a/ffffff?text=Bounty+Quest+${category}`;
    
    const placeholderResponse = await fetch(placeholderUrl);
    
    if (!placeholderResponse.ok) {
      throw new Error(`Failed to fetch placeholder image: ${placeholderResponse.statusText}`);
    }
    
    const imageArrayBuffer = await placeholderResponse.arrayBuffer();
    const buffer = Buffer.from(imageArrayBuffer);
    
    // Cache the image for future requests
    const base64Image = buffer.toString('base64');
    await db.collection("nft_images").insertOne({
      taskId,
      imageData: base64Image,
      createdAt: new Date()
    });
    
    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      }
    });

    /* 
    // Uncomment this code if you want to use Google's Generative AI to create images
    // Note: This requires the Gemini Pro Vision model access

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const prompt = `
      Create a beautiful digital award certificate or badge for a 
      Bounty Quest winner in the ${task.category} category.
      
      Task title: ${task.title || 'Blockchain Challenge'}
      Task description: ${task.description}
      
      Make it visually appealing with modern design elements related to 
      blockchain, web3, and the specific category (${task.category}).
      Include the text "Bounty Quest Winner" prominently.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const imageData = response.text(); // This assumes the model returns image data

    // Return the image with proper content type
    return new Response(imageData, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      }
    });
    */
  } catch (error: any) {
    console.error("Error generating NFT image:", error);
    
    return NextResponse.json(
      { error: "Failed to generate NFT image", message: error.message },
      { status: 500 }
    );
  }
} 