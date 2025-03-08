import { ObjectId } from 'mongodb';

export interface TweetSubmission {
  _id?: ObjectId;
  taskId: ObjectId;
  tweetId: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  tweetText: string;
  scores: {
    relevance: number;
    engagement: number;
    contentQuality: number;
    overall: number;
  };
  feedback: string;
  metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    impression_count: number;
  };
  createdAt: Date;
  status: 'submitted' | 'approved' | 'rejected';
}
