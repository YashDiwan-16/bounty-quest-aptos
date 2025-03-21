"use server";

import { generateResponse } from "@/lib/gemini";
import { insertChatMessage } from "@/lib/chat-schema";

import { revalidatePath } from "next/cache";
import clientPromise from "@/lib/clientpromise";
import { TaskGeneratorService } from "@/services/taskGeneratorService";
export async function generateChatResponse(message: string) {
  try {
    if (!message) {
      throw new Error("Message is required");
    }

    // Connect to the database
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME);

    // Store the user message
    const query = await insertChatMessage(db, {
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    const tasks = await TaskGeneratorService.getAllTask();
    const contextPrompt = `
    You are an AI assistant dedicated to helping users with their tasks on this platform.

    IMPORTANT INSTRUCTIONS:
    1. ALWAYS respond in FIRST PERSON - use "I" not "the assistant" or "we"
    2. Keep responses helpful, direct, and conversational
    3. Speak as if you are personally guiding the user through their tasks
    4. If you don't know something, admit it directly with "I don't have that information"
    
    AVAILABLE TASKS:
    ${tasks.map((task) => `
    TASK: ${task.title}
    DESCRIPTION: ${task.description}
    CATEGORY: ${task.category}
    REQUIREMENTS: ${task.requirements.join(', ')}
    EVALUATION CRITERIA: ${task.evaluationCriteria.join(', ')}
    REWARDS: ${task.rewards.usdcAmount} USDC${task.rewards.nftReward ? `, ${task.rewards.nftReward}` : ''}
    STATUS: ${task.isActive ? 'Active' : 'Inactive'}
    DEADLINE: ${new Date(task.endTime).toLocaleString()}
    ${task.isWinnerDeclared ? `WINNER DECLARED: Yes` : 'WINNER DECLARED: No'}
    `).join('\n')}
    
    USER PROFILE:
    As needed, reference any relevant user profile details to personalize responses.
    
    USER QUESTION: ${message}
    
    Remember to maintain a helpful, friendly tone while providing detailed information about tasks when requested. Always respond in FIRST PERSON.
    `;

    // Generate response with context
    const responseText = await generateResponse([
      {
        role: "user",
        content: contextPrompt,
      },
    ]);

    // Store the assistant response
    await insertChatMessage(db, {
      queryId: query.insertedId.toString(),
      role: "assistant",
      content: responseText,
      timestamp: new Date(),
    });

    // Revalidate the chat path to refresh UI
    revalidatePath("/");

    return {
      success: true,
      response: responseText,
    };
  } catch (error) {
    console.error("Error in generate action:", error);
    return {
      success: false,
      error: "Failed to process request",
    };
  } 
}

export async function getChatHistory() {
  try {
    // Connect to the database
    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME);

    // Get the most recent conversation (limited to last 20 messages)
    const messages = await db
      .collection("chat_messages")
      .find({})
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();

    return {
      success: true,
      messages: messages.reverse(),
    };
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return {
      success: false,
      messages: [],
      error: "Failed to fetch chat history",
    };
  }
}