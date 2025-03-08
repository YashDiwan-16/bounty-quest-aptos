// types.ts
export interface Tweet {
  id: string;
  author_id: string;
  text: string;
  author: string;
  authorName: string;
  authorImage: string;
  stats: TweetStats;
  created_at: string;
  public_metrics: {
    bookmark_count: number;
    impression_count: number;
    like_count: number;
    quote_count: number;
    reply_count: number;
    retweet_count: number;
  }
  media: TweetMedia[];
}

export interface TweetMedia {
  type: string;
  url: string;
}

export interface TweetStats {
  likes: number;
  retweets: number;
  impressions: number;
  replies: number;
}

export interface TweetAnalysis {
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  topics: string[];
  suggestions: string[];
}


export interface GeminiAPIResponse {
  analysis: TweetAnalysis;
}

export interface TwitterApiTweet {
  data: {
    id: string;
    text: string;
    author_id: string;
    created_at: string;
    public_metrics: {
      retweet_count: number;
      reply_count: number;
      like_count: number;
      quote_count: number;
      bookmark_count: number;
      impression_count: number;
    };
    attachments?: {
      media_keys: string[];
    };
  };
  includes?: {
    media: Array<{
      media_key: string;
      type: string;
      url: string;
      preview_image_url: string;
    }>;
    users: Array<{
      id: string;
      name: string;
      username: string;
      profile_image_url: string;
    }>;
  };
}