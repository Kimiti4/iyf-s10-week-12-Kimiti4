/**
 * Feed Types
 *
 * Canonical content types for the unified feed.
 *
 * @module domain/feed/feedTypes
 */

export const FEED_CONTENT_TYPE = {
  POST: 'post',
  REEL: 'reel',
  JAM: 'jam',
};

export const FEED_TAB = {
  FOR_YOU: 'for_you',
  FOLLOWING: 'following',
  JAMS: 'jams',
};

/**
 * @typedef {Object} NormalizedFeedItem
 * @property {string} id - Stable unique key (prefixed: "post_x", "reel_x", "jam_x")
 * @property {string} type - 'post' | 'reel' | 'jam'
 * @property {Object} data - Normalized content (post/reel/jam shape)
 * @property {string} createdAt - ISO 8601 for sorting
 * @property {string} authorId - For dedup and diversity
 * @property {string} category - For diversity constraints
 * @property {number} engagementScore - Computed for ranking
 */
