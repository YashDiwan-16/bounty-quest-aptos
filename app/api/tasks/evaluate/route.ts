import { TaskGeneratorService } from "@/services/taskGeneratorService";
import { NextResponse } from "next/server";

const API_KEY = process.env.AUTHENTICATION_TOKEN; // Add this to your .env file

/**
 * Updates winners for completed tasks based on submission scores.
 *
 * This function:
 * 1. Finds all inactive tasks
 * 2. For each task, gets top 3 submissions sorted by overall score
 * 3. Updates the task with winner public keys
 *
 * - 200: Winners updated successfully
 * - 500: Failed to update winners
 */
export async function PUT(request: Request) {
  try {
    // const client = await clientPromise;
    // const db = client.db("tweetcontest");
    // const tasks = db.collection("tasks");
    // const submission = db.collection("submissions");
    // // check if the task is already evaluated
    // const completedTask = await tasks.find({ isActive: false }).toArray();
    // // After task is inactive then evaluate the task as submission collection have the task id and submission score. update the top 3 winners in the task collection winner field array
    // const taskIds = completedTask.map((task) => task._id);
    // for (const taskId of taskIds) {
    //   const submissions = await submission
    //     .find({ taskId: taskId.toString() })
    //     .sort({ "scores.overall": -1 })
    //     .limit(3)
    //     .toArray();
    //   const winners = submissions.map((submission) => submission.publicKey);
    //   const updatedWinner = await tasks.updateOne(
    //     { _id: taskId },
    //     { $set: { winners } }
    //   );
    const apiKey = request.headers.get("Authorization");
    if (apiKey !== `Bearer ${API_KEY}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedWinner = await TaskGeneratorService.setTaskWinner();
    return NextResponse.json(
      { message: "Winners updated successfully", updatedWinner },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update winners" },
      { status: 500 }
    );
  }
}
