import { TwitterApi } from 'twitter-api-v2';
import { NextResponse } from 'next/server';
import { adaptTwitterResponse } from '@/lib/adapters';
import { TwitterApiTweet } from '@/lib/types';

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
});

async function fetchTweetData(tweetId: string) {
  try {
    const tweet = await twitterClient.v2.singleTweet(tweetId, {
      expansions: ['author_id', 'attachments.media_keys'],
      'tweet.fields': ['created_at', 'public_metrics', 'text'],
      'user.fields': ['name', 'username', 'profile_image_url'],
    });
    return tweet;
  } catch (error) {
    console.error('Error fetching tweet:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    const tweetId = url.split('/status/')[1]?.split('?')[0];
    if (!tweetId) {
      return NextResponse.json(
        { error: 'Invalid Twitter URL' },
        { status: 400 }
      );
    }

    const tweetData = await fetchTweetData(tweetId);
    if (!tweetData || !tweetData.data || !tweetData.data.author_id) {
      throw new Error('Failed to fetch valid tweet data');
    }

    const adaptedTweet = adaptTwitterResponse(tweetData as TwitterApiTweet);
    return NextResponse.json({ data: adaptedTweet });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: error || 'Failed to fetch tweet data' },
      { status: 500 }
    );
  }
}