import { TaskGeneratorService } from "@/services/taskGeneratorService";
import { NextResponse } from "next/server";
export const revalidate = 0;

export async function GET() {
  try {
    const checkTaskStatus = await TaskGeneratorService.checkTaskStatus();
    return NextResponse.json({ message: 'Task status checked successfully', checkTaskStatus }, { status: 200 });
  }
  catch (error) {
    console.error('Error checking task status:', error);
    return NextResponse.json({ message: 'Failed to check task status' }, { status: 500 });
  }
}