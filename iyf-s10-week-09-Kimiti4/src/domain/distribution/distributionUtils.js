/**
 * Distribution Utilities
 *
 * Helpers for formatting and transforming distribution data.
 *
 * @module domain/distribution/distributionUtils
 */

/**
 * Check if Web Share API is available.
 * @returns {boolean}
 */
export function canUseNativeShare() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Format repost count for display.
 * @param {number} count
 * @returns {string}
 */
export function formatRepostCount(count) {
  if (!count || count === 0) return '';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

/**
 * Format remix count for display.
 * @param {number} count
 * @returns {string}
 */
export function formatRemixCount(count) {
  return formatRepostCount(count);
}

/**
 * Build a remix preview object from an original item and new content.
 * @param {Object} original - Source content
 * @param {Object} newContent - User-created content for the remix
 * @param {string} currentUserId - Remix creator ID
 * @returns {Object} Remix preview for the creation flow
 */
export function buildRemixPreview(original, newContent, currentUserId) {
  return {
    sourceType: original.type || 'post',
    sourceContentId: original.id,
    sourceCreatorId: original.author?.id || original.authorId || original.creatorId,
    sourceTitle: original.title || original.caption || '',
    sourceAuthorName: original.author?.username || original.author?.name || 'Creator',
    sourceAuthorAvatar: original.author?.avatar || original.author?.profile?.avatar || null,
    sourcePreview: (original.content || original.caption || '').slice(0, 200),
    creatorId: currentUserId,
    content: newContent,
  };
}
