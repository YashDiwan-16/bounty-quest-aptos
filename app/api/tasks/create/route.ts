// app/api/tasks/create/route.ts
import { NextResponse } from "next/server";
import { TaskGeneratorService } from "@/services/taskGeneratorService";
const API_KEY = process.env.AUTHENTICATION_TOKEN; // Add this to your .env file

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get("Authorization");

    if (apiKey !== `Bearer ${API_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { durationHours } = await request.json();

    // Validate duration
    if (!durationHours || durationHours < 1 || durationHours > 24) {
      return NextResponse.json(
        { error: "Duration must be between 1 and 24 hours" },
        { status: 400 }
      );
    }

    // Create new task
    const taskId = await TaskGeneratorService.createNewTask(durationHours);

    return NextResponse.json({ taskId });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
