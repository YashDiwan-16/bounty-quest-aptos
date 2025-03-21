"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { generateChatResponse } from "@/actions/generate";


interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isPulsing, setIsPulsing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello, I'm the Bounty Quest AI. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messageRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && messageRef.current) {
      messageRef.current.focus();
    }
  }, [isOpen]);

  // Fetch chat history when opened
  // useEffect(() => {
  //   if (isOpen) {
  //     fetchChatHistory();
  //   }
  // }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Pulse animation every 30 seconds
  useEffect(() => {
    if (!isOpen) {
      const interval = setInterval(() => {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 2000);
      }, 30000);

      // Initial pulse
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 2000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // const fetchChatHistory = async () => {
  //   try {
  //     const result = await getChatHistory();

  //     if (result.success && result.messages && result.messages.length > 0) {
  //       const formattedMessages = result.messages.map((msg) => ({
  //         role: msg.role as "user" | "assistant",
  //         content: msg.content as string,
  //         timestamp: new Date(msg.timestamp),
  //       }));
  //       setMessages(formattedMessages);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch chat history:", error);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = {
      role: "user" as const,
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // Use the server action directly
      const result = await generateChatResponse(userMessage.content);

      if (result.success && result.response) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: result.response,
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error(result.error || "Failed to generate response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble responding right now. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50">
      {isOpen ? (
        <Card
          className={cn(
            "p-3 sm:p-4 w-[calc(100vw-32px)] sm:w-[350px] md:w-[400px] h-[450px] sm:h-[500px] flex flex-col shadow-lg",
            "bg-gradient-to-br from-background to-background/95 dark:from-background dark:to-background/90",
            "border border-border/50 dark:border-border/30",
            "animate-in slide-in-from-bottom-5 duration-300"
          )}
        >
          <div className="flex justify-between items-center mb-3 sm:mb-4 border-b dark:border-border/30 pb-2 sm:pb-3">
            <div className="flex items-center space-x-2">
              <div className="bg-primary dark:bg-primary h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center">
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base">
                Chat with us
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="hover:bg-muted dark:hover:bg-muted/30 cursor-pointer rounded-full h-7 w-7 sm:h-8 sm:w-8 p-0"
              aria-label="Close chat"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>

          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto mb-3 sm:mb-4 border dark:border-border/30 rounded-md p-2 sm:p-3 bg-muted/30 dark:bg-muted/10"
          >
            <div className="flex flex-col gap-2 sm:gap-3">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-2 sm:p-3 rounded-lg max-w-[85%] sm:max-w-[80%]",
                    msg.role === "assistant"
                      ? "bg-primary/10 dark:bg-primary/20 rounded-tl-none self-start"
                      : "bg-muted dark:bg-muted/30 rounded-tr-none self-end"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="text-xs sm:text-sm dark:text-foreground prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          a: ({ ...props }) => (
                            <a
                              {...props}
                              style={{
                                color: "#6F42C1",
                              }}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm dark:text-foreground">
                      {msg.content}
                    </p>
                  )}
                  <span className="text-[10px] sm:text-xs text-muted-foreground dark:text-muted-foreground/80 mt-1 block">
                    {msg.role === "assistant" ? `Bounty Quest AI` : "You"} •{" "}
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="bg-primary/10 dark:bg-primary/20 p-2 sm:p-3 rounded-lg rounded-tl-none max-w-[85%] sm:max-w-[80%] self-start">
                  <div className="flex space-x-2">
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/50 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/50 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary/50 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={messageRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 sm:p-2.5 border dark:border-border/30 rounded-full text-xs sm:text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none bg-background dark:bg-background/80"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-full h-8 w-8 sm:h-10 sm:w-10 hover:scale-105 transition-transform cursor-pointer"
              disabled={!message.trim() || isLoading}
            >
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </form>
        </Card>
      ) : (
        <div className="relative">
          <Button
            onClick={() => setIsOpen(true)}
            size="icon"
            className={cn(
              "rounded-full cursor-pointer h-12 w-12 sm:h-14 sm:w-14 shadow-lg dark:shadow-primary/10 hover:scale-110 transition-all duration-300",
              "bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
            )}
            aria-label="Open chat"
          >
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>

          {isPulsing && (
            <span className="absolute inset-0 rounded-full animate-ping bg-primary/75 dark:bg-primary/50 opacity-75"></span>
          )}
        </div>
      )}
    </div>
  );
}