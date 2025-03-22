import { Db } from "mongodb";

export interface ChatMessage {
  queryId?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const CHAT_COLLECTION = "chatMessages";

export async function insertChatMessage(db: Db, message: ChatMessage) {
  return db.collection(CHAT_COLLECTION).insertOne({
    ...message,
    timestamp: new Date(),
  });
}

export async function getChatHistory(db: Db, sessionId: string) {
  return db
    .collection(CHAT_COLLECTION)
    .find({ sessionId })
    .sort({ timestamp: 1 })
    .toArray();
}