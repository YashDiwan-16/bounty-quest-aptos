// app/api/tasks/active/route.ts
import { NextResponse } from "next/server";
import { TaskGeneratorService } from "@/services/taskGeneratorService";
export const revalidate = 0;

export async function GET() {
  try {
    const activeTasks = await TaskGeneratorService.getActiveTask();

    if (!activeTasks || activeTasks.length === 0) {
      return NextResponse.json(
        { error: "No active task found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ task: activeTasks });
  } catch (error) {
    console.error("Error fetching active task:", error);
    return NextResponse.json(
      { error: "Failed to fetch active task" },
      { status: 500 }
    );
  }
}
