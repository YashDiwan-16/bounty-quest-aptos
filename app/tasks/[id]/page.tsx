import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Task } from "@/types/challenge";
// import dynamic from "next/dynamic";
import TaskSubmissionSection from "@/components/TaskSubmissionSection";
import Timer from "@/components/Timer";

// Import client components dynamically
// const Timer = dynamic(() => import("@/components/Timer"), { ssr: false });

async function getTask(id: string): Promise<Task> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/active/${id}`,
    {
      next: { revalidate: 60 }, // Revalidate every minute
    }
  );

  if (!response.ok) throw new Error("Task not found");
  const data = await response.json();
  return data.task;
}

export default async function TaskById({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const task = await getTask((await params).id);

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-small-black/[0.2] dark:bg-grid-small-white/[0.2]" />
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm" />
        <div className="relative space-y-8 text-center px-4">
          <div className="space-y-2">
            <p className="text-9xl mb-4 select-none">🥺</p>
            <h1 className="text-8xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary/60 bg-clip-text text-transparent animate-gradient">
              404
            </h1>
            <h2 className="text-2xl font-semibold tracking-tight mt-4">
              Oops! Task Not Found
            </h2>
          </div>
          <p className="text-muted-foreground text-lg max-w-[460px] mx-auto">
            We couldn&apos;t find the task you were looking for. Perhaps it was
            removed or the URL is incorrect?
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button asChild variant="default" size="lg">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/tasks">View All Tasks</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <Link href="/tasks">
          <Button
            variant="outline"
            className="mb-6 hover:bg-white/90 shadow-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Card className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm border border-purple-100 dark:border-purple-900 shadow-xl">
            <CardHeader className="space-y-4 p-8">
              <div className="space-y-2">
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {task.title}
                </CardTitle>
                <CardDescription className="text-xl font-medium text-gray-600 dark:text-gray-300">
                  {task.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 p-8 pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex items-center space-x-3 bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                  <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-xl text-green-700 dark:text-green-300">
                    {task.rewards.usdcAmount} USDC
                  </span>
                </div>

                <div className="flex items-center space-x-3 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-xl text-blue-700 dark:text-blue-300">
                    {new Date(task.endTime) > new Date() ? (
                      <Timer endtime={task.endTime} />
                    ) : (
                      "Task Ended"
                    )}
                  </span>
                </div>
              </div>

              <div className="bg-purple-50/50 dark:bg-gray-800/50 rounded-xl p-6 shadow-inner">
                <h3 className="font-bold text-xl mb-6 text-purple-900 dark:text-purple-100">
                  Task Requirements
                </h3>
                <ul className="space-y-4">
                  {task.requirements?.map((req, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-3 text-gray-700 dark:text-gray-200"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-200 dark:bg-purple-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-lg">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <TaskSubmissionSection task={task} />
          </div>
        </div>
      </div>
    </div>
  );
}
