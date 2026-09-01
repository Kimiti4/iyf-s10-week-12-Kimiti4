/**
 * Distribution API Service
 *
 * Handles Share, Repost, and Remix backend operations.
 * Repost endpoints reuse the existing posts engage API.
 * Remix creates a new post with source attribution.
 *
 * @module services/distributionApi
 */

import { request } from './apiClient';
import { normalizePost } from '../contracts/postContract';

export const distributionAPI = {
  /**
   * Record a share event (best-effort, no persistence guarantee).
   * @param {'post'|'reel'|'jam'} sourceType
   * @param {string} sourceId
   * @param {'link'|'native'|'clipboard'} method
   */
  recordShare: async (sourceType, sourceId, method = 'link') => {
    try {
      await request('/distribution/share', {
        method: 'POST',
        body: JSON.stringify({ sourceType, sourceId, method }),
      });
    } catch {
      // Best-effort — sharing still works even if tracking fails
    }
  },

  /**
   * Repost content to user's feed.
   * Uses the existing posts engage endpoint for posts.
   * @param {'post'|'reel'|'jam'} sourceType
   * @param {string} sourceId
   * @returns {Object} Updated repost state
   */
  repost: async (sourceType, sourceId) => {
    if (sourceType === 'post') {
      const data = await request(`/posts/${sourceId}/engage?type=repost`, { method: 'PATCH' });
      return {
        repostCount: data.reblogs ?? data.repostCount ?? 0,
        isReposted: true,
      };
    }
    // Fallback: generic distribution endpoint
    const data = await request('/distribution/repost', {
      method: 'POST',
      body: JSON.stringify({ sourceType, sourceId }),
    });
    return {
      repostCount: data.repostCount ?? 0,
      isReposted: true,
      repostId: data.repost?.id || data.id,
    };
  },

  /**
   * Undo a repost.
   * @param {'post'|'reel'|'jam'} sourceType
   * @param {string} sourceId
   * @returns {Object} Updated repost state
   */
  undoRepost: async (sourceType, sourceId) => {
    if (sourceType === 'post') {
      const data = await request(`/posts/${sourceId}/engage?type=unrepost`, { method: 'PATCH' });
      return {
        repostCount: data.reblogs ?? data.repostCount ?? 0,
        isReposted: false,
      };
    }
    const data = await request('/distribution/repost', {
      method: 'DELETE',
      body: JSON.stringify({ sourceType, sourceId }),
    });
    return {
      repostCount: data.repostCount ?? 0,
      isReposted: false,
    };
  },

  /**
   * Create a remix — a new post derived from existing content.
   * @param {Object} remixData - { sourceType, sourceContentId, title, content, media }
   * @returns {Object} Normalized post
   */
  createRemix: async (remixData) => {
    const data = await request('/distribution/remix', {
      method: 'POST',
      body: JSON.stringify(remixData),
    });
    return normalizePost(data.post || data);
  },
};
