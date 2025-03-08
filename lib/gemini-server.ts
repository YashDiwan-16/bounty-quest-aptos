import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing Gemini API key');
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
