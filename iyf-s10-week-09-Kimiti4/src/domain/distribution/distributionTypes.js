/**
 * Distribution Types
 *
 * Canonical types for the Share / Repost / Remix distribution layer.
 * These are the three distinct content-distribution primitives.
 *
 * @module domain/distribution/distributionTypes
 */

export const DISTRIBUTION_ACTION = {
  SHARE: 'share',
  REPOST: 'repost',
  REMIX: 'remix',
};

export const SHARE_METHOD = {
  LINK: 'link',
  NATIVE: 'native',
  CLIPBOARD: 'clipboard',
};

/**
 * @typedef {Object} RepostRecord
 * @property {string} id - Repost record ID
 * @property {string} actorId - User who reposted
 * @property {'post'|'reel'|'jam'} sourceType - Type of original content
 * @property {string} sourceContentId - ID of original content
 * @property {string} createdAt - ISO 8601
 */

/**
 * @typedef {Object} RemixRecord
 * @property {string} id - Remix record ID
 * @property {string} creatorId - User who created the remix
 * @property {'post'|'reel'|'jam'} sourceType - Type of original content
 * @property {string} sourceContentId - ID of original content
 * @property {string} sourceCreatorId - ID of original content creator
 * @property {string} createdAt - ISO 8601
 */

/**
 * @typedef {Object} FeedDistributionMeta
 * @property {'original'|'repost'|'remix'} distributionKind - How this item entered the feed
 * @property {string} [repostActorId] - Who reposted (for reposts)
 * @property {string} [remixCreatorId] - Who remixed (for remixes)
 * @property {string} [sourceContentId] - Original content ID (for reposts/remixes)
 * @property {string} [sourceCreatorId] - Original creator ID (for remixes)
 */
