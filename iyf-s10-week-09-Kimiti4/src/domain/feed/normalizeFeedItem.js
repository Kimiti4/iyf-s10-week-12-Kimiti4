/**
 * Feed Item Normalizer
 *
 * Converts raw API responses from posts/reels/jams into a unified
 * NormalizedFeedItem shape. This is the single source of truth for
 * how content enters the feed.
 *
 * @module domain/feed/normalizeFeedItem
 */

import { FEED_CONTENT_TYPE } from './feedTypes';

/**
 * Normalize a raw item into a feed item.
 * @param {string} type - One of FEED_CONTENT_TYPE
 * @param {Object} raw - Raw API response
 * @returns {NormalizedFeedItem|null}
 */
export function normalizeFeedItem(type, raw) {
  if (!raw) return null;

  switch (type) {
    case FEED_CONTENT_TYPE.POST:
      return normalizePost(raw);
    case FEED_CONTENT_TYPE.REEL:
      return normalizeReel(raw);
    case FEED_CONTENT_TYPE.JAM:
      return normalizeJam(raw);
    default:
      return null;
  }
}

function normalizePost(raw) {
  const author = raw.author || {};
  return {
    id: `post_${raw.id || raw._id}`,
    type: FEED_CONTENT_TYPE.POST,
    data: {
      id: raw.id || raw._id,
      title: raw.title || '',
      content: raw.content || '',
      image: raw.image || raw.imageUrl || null,
      author: {
        id: author._id || author.id || '',
        username: author.username || 'Anonymous',
        avatar: author.profile?.avatar || author.avatar || null,
        isVerified: author.verification?.isVerified || false,
      },
      category: raw.category || 'all',
      likeCount: raw.likes ?? raw.likeCount ?? 0,
      commentCount: raw.comments ?? raw.commentCount ?? 0,
      repostCount: raw.reblogs ?? raw.repostCount ?? 0,
      saveCount: raw.saves ?? raw.saveCount ?? 0,
      isLiked: raw.liked ?? raw.isLiked ?? false,
      isReposted: raw.reblogged ?? raw.isReposted ?? false,
      isSaved: raw.bookmarked ?? raw.isSaved ?? false,
      createdAt: raw.createdAt || new Date().toISOString(),
    },
    createdAt: raw.createdAt || new Date().toISOString(),
    authorId: author._id || author.id || raw.authorId || '',
    category: raw.category || 'all',
    engagementScore: computePostEngagement(raw),
  };
}

function normalizeReel(raw) {
  const author = raw.author || {};
  return {
    id: `reel_${raw.id || raw._id}`,
    type: FEED_CONTENT_TYPE.REEL,
    data: {
      id: raw.id || raw._id,
      videoUrl: raw.videoUrl || raw.url || '',
      posterUrl: raw.posterUrl || raw.thumbnail || null,
      caption: raw.caption || raw.content || '',
      author: {
        id: author._id || author.id || '',
        username: author.username || 'Creator',
        avatar: author.profile?.avatar || author.avatar || null,
        isVerified: author.verification?.isVerified || false,
      },
      jamId: raw.jamId || null,
      jamTitle: raw.jamTitle || null,
      jamCTA: raw.jamCTA || null,
      likeCount: raw.likes ?? raw.likeCount ?? 0,
      commentCount: raw.comments ?? raw.commentCount ?? 0,
      shareCount: raw.shares ?? raw.shareCount ?? 0,
      viewCount: raw.views ?? raw.viewCount ?? 0,
      isLiked: raw.liked ?? raw.isLiked ?? false,
      isSaved: raw.bookmarked ?? raw.isSaved ?? false,
      createdAt: raw.createdAt || new Date().toISOString(),
    },
    createdAt: raw.createdAt || new Date().toISOString(),
    authorId: author._id || author.id || raw.authorId || '',
    category: 'reels',
    engagementScore: computeReelEngagement(raw),
  };
}

function normalizeJam(raw) {
  const creator = raw.creator || {};
  return {
    id: `jam_${raw.id || raw._id}`,
    type: FEED_CONTENT_TYPE.JAM,
    data: {
      id: raw.id || raw._id,
      title: raw.title || '',
      prompt: raw.prompt || '',
      description: raw.description || '',
      status: raw.status || 'active',
      category: raw.category || 'other',
      participationTypes: raw.participationTypes || [],
      participantCount: raw.participantCount ?? 0,
      contributionCount: raw.contributionCount ?? 0,
      deadline: raw.deadline || null,
      coverMediaUrl: raw.coverMediaUrl || null,
      creator: {
        id: creator._id || creator.id || '',
        username: creator.username || 'Creator',
        avatar: creator.profile?.avatar || creator.avatar || null,
      },
      createdAt: raw.createdAt || new Date().toISOString(),
    },
    createdAt: raw.createdAt || new Date().toISOString(),
    authorId: creator._id || creator.id || raw.creatorId || '',
    category: raw.category || 'other',
    engagementScore: computeJamEngagement(raw),
  };
}

function computePostEngagement(raw) {
  const likes = raw.likes ?? raw.likeCount ?? 0;
  const comments = raw.comments ?? raw.commentCount ?? 0;
  const reblogs = raw.reblogs ?? raw.repostCount ?? 0;
  return likes * 1 + comments * 2 + reblogs * 3;
}

function computeReelEngagement(raw) {
  const likes = raw.likes ?? raw.likeCount ?? 0;
  const comments = raw.comments ?? raw.commentCount ?? 0;
  const views = raw.views ?? raw.viewCount ?? 0;
  return likes * 1 + comments * 2 + views * 0.1;
}

function computeJamEngagement(raw) {
  const participants = raw.participantCount ?? 0;
  const contributions = raw.contributionCount ?? 0;
  return participants * 2 + contributions * 3;
}
