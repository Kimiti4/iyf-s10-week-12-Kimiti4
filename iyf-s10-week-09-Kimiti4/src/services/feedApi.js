/**
 * Feed API Service
 *
 * Fetches mixed content from posts, reels, and jams endpoints,
 * normalizes to feed items, and returns a unified stream.
 *
 * @module services/feedApi
 */

import { postsAPI } from './postApi';
import { reelsAPI } from './reelApi';
import { jamsAPI } from './jamApi';
import { normalizeFeedItem } from '../domain/feed/normalizeFeedItem';
import { FEED_CONTENT_TYPE } from '../domain/feed/feedTypes';

const PAGE_SIZE = 20;

/**
 * Fetch the "For You" feed — mixed content from all sources.
 */
export async function fetchForYouFeed(page = 1) {
  const limit = Math.ceil(PAGE_SIZE / 3);

  const [postsResult, reelsResult, jamsResult] = await Promise.allSettled([
    postsAPI.getAll({ page, limit, sort: 'trending' }),
    reelsAPI.getAll({ page, limit }),
    jamsAPI.getAll({ page, limit, sort: 'popular' }),
  ]);

  const items = [];

  if (postsResult.status === 'fulfilled') {
    const posts = postsResult.value.posts || postsResult.value || [];
    posts.forEach((p) => {
      const item = normalizeFeedItem(FEED_CONTENT_TYPE.POST, p);
      if (item) items.push(item);
    });
  }

  if (reelsResult.status === 'fulfilled') {
    const reels = reelsResult.value.reels || reelsResult.value || [];
    reels.forEach((r) => {
      const item = normalizeFeedItem(FEED_CONTENT_TYPE.REEL, r);
      if (item) items.push(item);
    });
  }

  if (jamsResult.status === 'fulfilled') {
    const jams = jamsResult.value.jams || jamsResult.value || [];
    jams.forEach((j) => {
      const item = normalizeFeedItem(FEED_CONTENT_TYPE.JAM, j);
      if (item) items.push(item);
    });
  }

  // Check if any source has more
  const hasMore =
    (postsResult.status === 'fulfilled' && postsResult.value.hasMore) ||
    (reelsResult.status === 'fulfilled' && reelsResult.value.hasMore) ||
    (jamsResult.status === 'fulfilled' && jamsResult.value.hasMore);

  return { items, hasMore: !!hasMore, page };
}

/**
 * Fetch the "Following" feed — posts/reels from followed users.
 */
export async function fetchFollowingFeed(page = 1) {
  const limit = PAGE_SIZE;

  const [postsResult, reelsResult] = await Promise.allSettled([
    postsAPI.getAll({ page, limit, sort: 'recent', feed: 'following' }),
    reelsAPI.getAll({ page, limit, feed: 'following' }),
  ]);

  const items = [];

  if (postsResult.status === 'fulfilled') {
    const posts = postsResult.value.posts || postsResult.value || [];
    posts.forEach((p) => {
      const item = normalizeFeedItem(FEED_CONTENT_TYPE.POST, p);
      if (item) items.push(item);
    });
  }

  if (reelsResult.status === 'fulfilled') {
    const reels = reelsResult.value.reels || reelsResult.value || [];
    reels.forEach((r) => {
      const item = normalizeFeedItem(FEED_CONTENT_TYPE.REEL, r);
      if (item) items.push(item);
    });
  }

  const hasMore =
    (postsResult.status === 'fulfilled' && postsResult.value.hasMore) ||
    (reelsResult.status === 'fulfilled' && reelsResult.value.hasMore);

  return { items, hasMore: !!hasMore, page };
}

/**
 * Fetch the "Jams" feed — only Jams.
 */
export async function fetchJamsFeed(page = 1) {
  const limit = PAGE_SIZE;

  const result = await jamsAPI.getAll({ page, limit, sort: 'popular' });
  const jams = result.jams || result || [];
  const items = [];

  jams.forEach((j) => {
    const item = normalizeFeedItem(FEED_CONTENT_TYPE.JAM, j);
    if (item) items.push(item);
  });

  return { items, hasMore: result.hasMore ?? false, page };
}

/**
 * Fetch feed by tab.
 */
export async function fetchFeedByTab(tab, page = 1) {
  switch (tab) {
    case 'following':
      return fetchFollowingFeed(page);
    case 'jams':
      return fetchJamsFeed(page);
    case 'for_you':
    default:
      return fetchForYouFeed(page);
  }
}
