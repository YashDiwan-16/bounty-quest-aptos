import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateResponse(
  messages: { role: string; content: string }[]
) {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-pro-exp-02-05",
    });

    // Extract system message if present
    let systemInstruction = "";
    let userMessages = [...messages];

    if (messages[0]?.role === "system") {
      systemInstruction = messages[0].content;
      userMessages = messages.slice(1);
    }

    // Create chat session with system instruction if provided
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.4,
        topP: 0.95,
      },
      systemInstruction: systemInstruction || undefined,
    });

    // Send the user message and get response
    const result = await chat.sendMessage(
      userMessages[userMessages.length - 1].content
    );
    const response = result.response;

    return response.text();
  } catch (error) {
    console.error("Error generating response from Gemini:", error);
    return "I'm sorry, I encountered an error while processing your request.";
  }
}