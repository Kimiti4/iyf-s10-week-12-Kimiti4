/**
 * Distribution Rules
 *
 * Validation rules for Share / Repost / Remix operations.
 * Centralizes business logic that would otherwise scatter across components.
 *
 * @module domain/distribution/distributionRules
 */

import { DISTRIBUTION_ACTION } from './distributionTypes';
import { CONTENT_STATUS } from '../trust/trustTypes';

/**
 * Check whether a user can repost a given item.
 * @param {Object} item - Feed item or content record
 * @param {string} currentUserId - Authenticated user ID
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canRepost(item, currentUserId) {
  if (!item || !currentUserId) {
    return { allowed: false, reason: 'Authentication required' };
  }

  const contentStatus = item.contentStatus || CONTENT_STATUS.ACTIVE;
  if (contentStatus === CONTENT_STATUS.REMOVED) {
    return { allowed: false, reason: 'Content has been removed' };
  }
  if (contentStatus === CONTENT_STATUS.LIMITED) {
    return { allowed: false, reason: 'Content has been limited' };
  }

  const authorId = item.author?.id || item.authorId || item.creatorId;
  if (authorId === currentUserId) {
    return { allowed: false, reason: 'Cannot repost your own content' };
  }

  if (item.isReposted) {
    return { allowed: false, reason: 'Already reposted' };
  }

  if (item.type === 'repost') {
    return { allowed: false, reason: 'Cannot repost a repost' };
  }

  return { allowed: true };
}

/**
 * Check whether a user can remix a given item.
 * @param {Object} item - Feed item or content record
 * @param {string} currentUserId - Authenticated user ID
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canRemix(item, currentUserId) {
  if (!item || !currentUserId) {
    return { allowed: false, reason: 'Authentication required' };
  }

  const contentStatus = item.contentStatus || CONTENT_STATUS.ACTIVE;
  if (contentStatus === CONTENT_STATUS.REMOVED) {
    return { allowed: false, reason: 'Content has been removed' };
  }
  if (contentStatus === CONTENT_STATUS.LIMITED) {
    return { allowed: false, reason: 'Content has been limited' };
  }

  if (item.type === 'jam') {
    return { allowed: false, reason: 'Jams cannot be remixed' };
  }

  return { allowed: true };
}

/**
 * Build the share URL for a content item.
 * @param {Object} item - Feed item or content record
 * @returns {string}
 */
export function buildShareUrl(item) {
  if (!item) return window.location.origin;

  const type = item.type || 'post';
  const id = item.id;

  const pathMap = {
    post: `/posts/${id}`,
    reel: `/reels/${id}`,
    jam: `/jams/${id}`,
    repost: `/posts/${item.sourceContentId || id}`,
    remix: `/posts/${id}`,
  };

  return `${window.location.origin}${pathMap[type] || `/posts/${id}`}`;
}

/**
 * Build share metadata for Web Share API or clipboard.
 * @param {Object} item
 * @returns {{ title: string, text: string, url: string }}
 */
export function buildShareMeta(item) {
  const title = item.title || item.caption || item.content?.slice(0, 100) || 'Check this out';
  const text = item.content || item.caption || item.description || title;
  return { title, text, url: buildShareUrl(item) };
}
