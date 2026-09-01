/**
 * J-019: Analytics Domain Layer
 *
 * Canonical types and business logic for content propagation,
 * participation, and creator analytics.
 */

/** Content propagation metrics */
export const PROPAGATION_METRIC = {
  VIEWS: 'views',
  LIKES: 'likes',
  COMMENTS: 'comments',
  SHARES: 'shares',
  REPOSTS: 'reposts',
  REMIXES: 'remixes',
  SAVES: 'saves',
  ENGAGEMENT_RATE: 'engagement_rate',
};

/** Participation status for a user in a Jam */
export const PARTICIPATION_STATUS = {
  INVITED: 'invited',
  JOINED: 'joined',
  CONTRIBUTING: 'contributing',
  COMPLETED: 'completed',
  LEFT: 'left',
};

/** Time ranges for analytics queries */
export const TIME_RANGE = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  ALL_TIME: 'all_time',
};

/** Granularity for time-series data */
export const GRANULARITY = {
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
};

/**
 * Compute virality score for content.
 * Virality = (shares + remixes) / max(views, 1) * timeDecayFactor
 * Higher score = content spreading faster.
 *
 * @param {Object} metrics - { views, shares, remixes, createdAt }
 * @returns {number} Virality score 0-100
 */
export function computeViralityScore({ views = 0, shares = 0, remixes = 0, createdAt }) {
  if (views === 0) return 0;

  const spreadActions = shares + remixes;
  const baseScore = (spreadActions / views) * 100;

  // Time decay: older content gets lower scores
  const ageHours = createdAt
    ? (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60)
    : 0;
  const decayFactor = Math.max(0.1, 1 - (ageHours / (24 * 7))); // Decays over 7 days

  return Math.min(100, Math.round(baseScore * decayFactor));
}

/**
 * Compute engagement rate for content.
 * Engagement rate = (likes + comments + shares + saves) / max(views, 1) * 100
 *
 * @param {Object} metrics - { views, likes, comments, shares, saves }
 * @returns {number} Engagement rate percentage
 */
export function computeEngagementRate({ views = 0, likes = 0, comments = 0, shares = 0, saves = 0 }) {
  if (views === 0) return 0;
  const totalEngagement = likes + comments + shares + saves;
  return Math.round((totalEngagement / views) * 100 * 10) / 10; // 1 decimal
}

/**
 * Compute propagation depth (network hops from original poster).
 *
 * @param {Object} content - content with remixOf or repostOf chain
 * @returns {number} Depth 0 = original, 1 = first reshare, etc.
 */
export function computePropagationDepth(content) {
  let depth = 0;
  let current = content;
  const visited = new Set();

  while (current && (current.remixOf || current.repostOf)) {
    if (visited.has(current.id)) break; // Cycle protection
    visited.add(current.id);
    depth++;
    current = current.remixOf || current.repostOf;
  }

  return Math.min(depth, 10); // Cap at 10
}

/**
 * Classify content performance tier based on engagement.
 *
 * @param {number} engagementRate - Engagement rate percentage
 * @returns {{ tier: string, label: string, color: string }}
 */
export function classifyPerformanceTier(engagementRate) {
  if (engagementRate >= 10) return { tier: 'viral', label: 'Viral', color: 'var(--danger)' };
  if (engagementRate >= 5) return { tier: 'trending', label: 'Trending', color: 'var(--warning)' };
  if (engagementRate >= 2) return { tier: 'growing', label: 'Growing', color: 'var(--success)' };
  if (engagementRate >= 0.5) return { tier: 'steady', label: 'Steady', color: 'var(--info)' };
  return { tier: 'quiet', label: 'Quiet', color: 'var(--text-tertiary)' };
}

/**
 * Format a metric value for display.
 * Views/likes → compact numbers (1.2k, 3.4M)
 * Rates → percentages
 *
 * @param {number} value
 * @param {string} type - 'count' | 'rate' | 'duration'
 * @returns {string}
 */
export function formatMetricValue(value, type = 'count') {
  if (value == null || isNaN(value)) return '0';

  switch (type) {
    case 'rate':
      return `${value}%`;
    case 'duration': {
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    }
    case 'count':
    default: {
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
      if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
      return String(value);
    }
  }
}

/**
 * Get time range boundaries for a given range.
 *
 * @param {string} range - TIME_RANGE value
 * @returns {{ start: Date, end: Date }}
 */
export function getTimeRangeBounds(range) {
  const end = new Date();
  const start = new Date();

  switch (range) {
    case TIME_RANGE.DAY:
      start.setDate(start.getDate() - 1);
      break;
    case TIME_RANGE.WEEK:
      start.setDate(start.getDate() - 7);
      break;
    case TIME_RANGE.MONTH:
      start.setMonth(start.getMonth() - 1);
      break;
    case TIME_RANGE.QUARTER:
      start.setMonth(start.getMonth() - 3);
      break;
    case TIME_RANGE.YEAR:
      start.setFullYear(start.getFullYear() - 1);
      break;
    case TIME_RANGE.ALL_TIME:
      start.setFullYear(2020);
      break;
    default:
      start.setDate(start.getDate() - 7);
  }

  return { start, end };
}
