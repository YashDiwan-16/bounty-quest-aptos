import type { TwitterApiTweet, Tweet, TweetStats } from './types';

export function adaptTwitterResponse(response: TwitterApiTweet): Tweet {
  if (!response.data) {
    throw new Error('Invalid tweet data received');
  }

  const { data, includes } = response;
  const author = includes?.users?.find(user => user.id === data.author_id);

  const stats: TweetStats = {
    likes: data.public_metrics?.like_count ?? 0,
    retweets: data.public_metrics?.retweet_count ?? 0,
    replies: data.public_metrics?.reply_count ?? 0,
    impressions: data.public_metrics?.impression_count ?? 0
  };

  const media = includes?.media?.map(item => ({
    type: item.type,
    url: item.url || item.preview_image_url
  })) || [];

  return {
    id: data.id,
    text: data.text,
    author: author?.username || 'unknown',
    author_id: data.author_id,
    authorName: author?.name || 'Unknown User',
    authorImage: author?.profile_image_url || '',
    stats,
    created_at: data.created_at,
    public_metrics: data.public_metrics,
    media
  };
}