// types/contest.ts
export interface TweetData {
    data: {
      id: string;
      text: string;
      author: string;
      authorName: string;
      authorImage: string;
      stats: {
        likes: number;
        retweets: number;
        replies: number;
        impressions: number;
      };
      created_at: string;
      public_metrics: {
        retweet_count: number;
        reply_count: number;
        like_count: number;
        quote_count: number;
        bookmark_count: number;
        impression_count: number;
      };
    };
  }
  
  export interface ContestEntry {
    tweetId: string;
    author: string;
    authorName: string;
    text: string;
    taskId: string;
    contentRelevanceScore: number;
    engagementScore: number;
    totalScore: number;
    metrics: {
      impressions: number;
      likes: number;
      retweets: number;
      replies: number;
    };
    evaluated: boolean;
    createdAt: Date;
  }
  
  export interface Task {
    _id?: string;
    description: string;
    startTime: Date;
    endTime: Date;
    isActive: boolean;
    winners: string[]; // Array of tweet IDs
  }