"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/types/challenge";
import { XWalletMapper } from "@/components/XWalletMapper";
import TwitterSubmissionForm from "@/components/TwitterSubmissionForm";
import ClientTweetCard from "@/components/ClientTweetCard";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function TaskSubmissionSection({ task }: { task: Task }) {
  const publicKey = useWallet().account?.address.toString();
  const [userPage, setUserPage] = useState<
    "submitted" | "unauthenticated" | "authenticated" | null
  >(null);
  const [submittedTweetId, setSubmittedTweetId] = useState<string | null>(null);

  useEffect(() => {
    const checkSubmission = async () => {
      try {
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicKey,
            taskId: task._id,
          }),
        });

        const data = await response.json();
        if (data.pagestate) {
          setUserPage(data.pagestate);
        }
        if (data.twitterId) {
          setSubmittedTweetId(data.twitterId);
        }
      } catch (error) {
        console.error("Failed to check submission:", error);
      }
    };

    checkSubmission();
  }, [publicKey, task._id]);

  if (userPage === null) {
    return <div className="animate-pulse">Loading verification status...</div>;
  }

  if (userPage === "unauthenticated") {
    return (
      <Card className="border border-purple-100 dark:border-purple-900 shadow-xl bg-white/80 dark:bg-gray-800/90">
        <CardContent className="p-8">
          <div className="mb-4 text-center text-red-500">
            Please verify your wallet before participating
          </div>
          <XWalletMapper />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {userPage === "submitted" ? (
        <Card className="border border-purple-100 dark:border-purple-900 shadow-xl bg-white/80 dark:bg-gray-800/90">
          <CardHeader>
            <CardTitle>Your Submission</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ClientTweetCard id={submittedTweetId || ""} />
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-purple-100 dark:border-purple-900 shadow-xl bg-white/80 dark:bg-gray-800/90">
          <CardContent className="p-8">
            <TwitterSubmissionForm task={task} />
          </CardContent>
        </Card>
      )}
    </>
  );
}
