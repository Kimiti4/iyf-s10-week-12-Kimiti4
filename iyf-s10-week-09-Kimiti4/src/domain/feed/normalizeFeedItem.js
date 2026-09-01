/**
 * Feed Item Normalizer
 *
 * Converts raw API responses from posts/reels/jams into a unified
 * NormalizedFeedItem shape. Uses the contract normalizers for inner data.
 *
 * @module domain/feed/normalizeFeedItem
 */

import { FEED_CONTENT_TYPE } from './feedTypes';
import { normalizePost as normalizePostContract } from '../../contracts/postContract';
import { normalizeReel as normalizeReelContract } from '../../contracts/reelContract';

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
      return wrapPost(raw);
    case FEED_CONTENT_TYPE.REEL:
      return wrapReel(raw);
    case FEED_CONTENT_TYPE.JAM:
      return wrapJam(raw);
    default:
      return null;
  }
}

function wrapPost(raw) {
  const post = normalizePostContract(raw);
  if (!post) return null;

  const distributionKind = raw.distributionKind || (raw.isRepost ? 'repost' : raw.isRemix ? 'remix' : 'original');

  return {
    id: `post_${post.id}`,
    type: FEED_CONTENT_TYPE.POST,
    data: post,
    createdAt: post.createdAt,
    authorId: post.author?.id || '',
    category: post.category || 'all',
    engagementScore: computePostEngagement(raw),
    distribution: {
      kind: distributionKind,
      repostActorId: raw.repostActorId || null,
      sourceContentId: raw.sourceContentId || null,
      sourceCreatorId: raw.sourceCreatorId || null,
      sourceCreatorName: raw.sourceCreatorName || null,
      sourceCreatorAvatar: raw.sourceCreatorAvatar || null,
    },
  };
}

function wrapReel(raw) {
  const reel = normalizeReelContract(raw);
  if (!reel) return null;

  const distributionKind = raw.distributionKind || (raw.isRepost ? 'repost' : raw.isRemix ? 'remix' : 'original');

  return {
    id: `reel_${reel.id}`,
    type: FEED_CONTENT_TYPE.REEL,
    data: reel,
    createdAt: reel.createdAt,
    authorId: reel.author?.id || '',
    category: 'reels',
    engagementScore: computeReelEngagement(raw),
    distribution: {
      kind: distributionKind,
      repostActorId: raw.repostActorId || null,
      sourceContentId: raw.sourceContentId || null,
      sourceCreatorId: raw.sourceCreatorId || null,
      sourceCreatorName: raw.sourceCreatorName || null,
      sourceCreatorAvatar: raw.sourceCreatorAvatar || null,
    },
  };
}

function wrapJam(raw) {
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
