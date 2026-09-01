/**
 * Feed Ranking Engine
 *
 * Deterministic ranking with diversity constraints.
 * No ML — explainable, weighted scoring.
 *
 * @module domain/feed/feedRanking
 */

import { FEED_CONTENT_TYPE } from './feedTypes';
import { CONTENT_STATUS } from '../trust/trustTypes';

// ===== RANKING WEIGHTS =====

const DEFAULT_WEIGHTS = {
  freshness: 0.30,
  engagement: 0.25,
  relationship: 0.20,
  completion: 0.10,
  participation: 0.10,
  diversity: 0.05,
};

// ===== DIVERSITY POLICY =====

const MAX_SAME_AUTHOR = 2;
const MAX_SAME_TYPE = 3;
const MAX_SAME_CATEGORY = 3;

/**
 * Score and rank a list of feed items.
 * @param {NormalizedFeedItem[]} items
 * @param {Object} context - { userId, followedIds, weights }
 * @returns {NormalizedFeedItem[]} Ranked items with diversity applied
 */
export function rankFeedItems(items, context = {}) {
  if (!items || items.length === 0) return [];

  const weights = { ...DEFAULT_WEIGHTS, ...context.weights };
  const followedIds = new Set(context.followedIds || []);

  // Score each item
  const scored = items.map((item) => ({
    ...item,
    _score: computeScore(item, context, weights, followedIds),
  }));

  // Sort by score descending
  scored.sort((a, b) => b._score - a._score);

  // Apply diversity constraints
  return applyDiversity(scored);
}

function computeScore(item, context, weights, followedIds) {
  let score = 0;

  // Moderation: removed content gets zero score (should be filtered before reaching here)
  if (item.contentStatus === CONTENT_STATUS.REMOVED) return 0;

  // Freshness: recency decay (items within 24h get full score, then decay)
  const ageMs = Date.now() - new Date(item.createdAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  const freshnessScore = Math.max(0, 1 - ageHours / 168); // Linear decay over 7 days
  score += freshnessScore * weights.freshness;

  // Engagement: normalized engagement score (capped)
  const engagementScore = Math.min(item.engagementScore / 100, 1);
  score += engagementScore * weights.engagement;

  // Relationship: followed author bonus
  const isFollowed = followedIds.has(item.authorId);
  score += (isFollowed ? 1 : 0) * weights.relationship;

  // Completion: reels get bonus (proxy for watch completion)
  if (item.type === FEED_CONTENT_TYPE.REEL) {
    score += 0.5 * weights.completion;
  }

  // Participation: jams get bonus for active jams
  if (item.type === FEED_CONTENT_TYPE.JAM && item.data?.status === 'active') {
    score += 0.7 * weights.participation;
  }

  // Distribution: reposts get a slight penalty vs original content
  // but still appear in feed (they represent social signal)
  const distKind = item.distribution?.kind;
  if (distKind === 'repost') {
    score *= 0.85;
  } else if (distKind === 'remix') {
    score *= 0.95; // Remixes are creative derivatives, slight penalty
  }

  // Moderation: under-review content gets demoted, limited content gets heavily demoted
  if (item.contentStatus === CONTENT_STATUS.UNDER_REVIEW) {
    score *= 0.5;
  } else if (item.contentStatus === CONTENT_STATUS.LIMITED) {
    score *= 0.2;
  }

  // Diversity: starts at full, reduced by the ranking pass
  score += 1 * weights.diversity;

  return score;
}

/**
 * Apply diversity constraints to prevent same-author/type domination.
 */
function applyDiversity(scored) {
  const result = [];
  const authorCounts = {};
  const typeCounts = {};
  const categoryCounts = {};

  for (const item of scored) {
    const authorId = item.authorId || '_unknown';
    const type = item.type;
    const category = item.category || '_none';

    const aCount = authorCounts[authorId] || 0;
    const tCount = typeCounts[type] || 0;
    const cCount = categoryCounts[category] || 0;

    if (aCount >= MAX_SAME_AUTHOR || tCount >= MAX_SAME_TYPE || cCount >= MAX_SAME_CATEGORY) {
      continue; // Skip — would violate diversity
    }

    authorCounts[authorId] = aCount + 1;
    typeCounts[type] = tCount + 1;
    categoryCounts[category] = cCount + 1;
    result.push(item);
  }

  return result;
}

/**
 * Remove duplicate items by ID.
 */
export function deduplicateItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/**
 * Detect and remove duplicate author-type combinations (same content reposted).
 * Reposts are excluded from dedup — they represent social distribution, not duplication.
 */
export function deduplicateContent(items) {
  const seen = new Set();
  return items.filter((item) => {
    // Reposts and remixes are social signals, not duplicates
    if (item.distribution?.kind === 'repost' || item.distribution?.kind === 'remix') {
      return true;
    }
    const key = `${item.authorId}_${item.type}_${item.data?.title || item.data?.caption || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
