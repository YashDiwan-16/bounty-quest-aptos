import React from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface SampleTweetProps {
  avatar: string;
  name: string;
  handle: string;
  content: string;
  timestamp: string;
  verified?: boolean;
}

const TwitterIcon = () => (
  <svg
    className="h-5 w-5 text-[#3BA9EE] transition-all ease-in-out hover:scale-105"
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
  >
    <g>
      <path fill="none" d="M0 0h24v24H0z"></path>
      <path d="M22.162 5.656a8.384 8.384 0 0 1-2.402.658A4.196 4.196 0 0 0 21.6 4c-.82.488-1.719.83-2.656 1.015a4.182 4.182 0 0 0-7.126 3.814 11.874 11.874 0 0 1-8.62-4.37 4.168 4.168 0 0 0-.566 2.103c0 1.45.738 2.731 1.86 3.481a4.168 4.168 0 0 1-1.894-.523v.052a4.185 4.185 0 0 0 3.355 4.101 4.21 4.21 0 0 1-1.89.072A4.185 4.185 0 0 0 7.97 16.65a8.394 8.394 0 0 1-6.191 1.732 11.83 11.83 0 0 0 6.41 1.88c7.693 0 11.9-6.373 11.9-11.9 0-.18-.005-.362-.013-.54a8.496 8.496 0 0 0 2.087-2.165z"></path>
    </g>
  </svg>
);

const VerifiedIcon = () => (
  <svg
    aria-label="Verified Account"
    className="ml-1 inline h-4 w-4 text-blue-500"
    viewBox="0 0 24 24"
  >
    <g fill="currentColor">
      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
    </g>
  </svg>
);

const SampleTweet: React.FC<SampleTweetProps> = ({
  avatar,
  name,
  handle,
  content,
  timestamp,
  verified = true,
}) => {
  return (
    <Card className="max-w-lg">
      <CardHeader className="pb-2">
        <div className="flex flex-row justify-between tracking-tight">
          <div className="flex items-center space-x-2">
            <div className="h-12 w-12 overflow-hidden rounded-full border border-transparent">
              <Image
                src={avatar}
                alt={`${name}'s avatar`}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center whitespace-nowrap font-semibold">
                {name}
                {verified && <VerifiedIcon />}
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-500">@{handle}</span>
              </div>
            </div>
          </div>
          <TwitterIcon />
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="break-words text-[15px] leading-normal text-gray-500 tracking-tighter">
          {content.split("\n").map((line, i) => (
            <p key={i} className="mb-1">
              {line}
            </p>
          ))}
        </div>
        <div className="mt-2 flex items-center space-x-4 text-gray-500 text-sm">
          <span>{timestamp}</span>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-center justify-between text-gray-500">
          <div className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>24</span>
          </div>
          <div className="flex items-center space-x-2 hover:text-green-500 transition-colors">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
            <span>12</span>
          </div>
          <div className="flex items-center space-x-2 hover:text-red-500 transition-colors">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>84</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SampleTweet;
