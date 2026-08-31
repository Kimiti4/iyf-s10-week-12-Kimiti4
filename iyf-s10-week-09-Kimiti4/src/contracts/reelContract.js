/**
 * Reel Domain Contract
 *
 * Canonical reel shape for the short-form video system.
 *
 * @module contracts/reelContract
 */

export const REEL_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  DELETED: 'deleted',
};

export const REEL_CAPTION_MAX = 2000;

/**
 * @typedef {Object} NormalizedReel
 * @property {string} id
 * @property {string} videoUrl
 * @property {string|null} posterUrl
 * @property {string} caption
 * @property {NormalizedReelAuthor} author
 * @property {string|null} jamId - Optional Jam reference
 * @property {string|null} jamTitle
 * @property {string|null} jamCTA
 * @property {string} createdAt
 * @property {number} likeCount
 * @property {number} commentCount
 * @property {number} shareCount
 * @property {number} viewCount
 * @property {boolean} isLiked
 * @property {boolean} isSaved
 */

/**
 * @typedef {Object} NormalizedReelAuthor
 * @property {string} id
 * @property {string} username
 * @property {string|null} avatar
 * @property {boolean} isVerified
 * @property {boolean} isFollowed
 */

export function normalizeReel(raw) {
  if (!raw) return null;

  const author = raw.author || {};
  return {
    id: raw.id || raw._id || '',
    videoUrl: raw.videoUrl || raw.url || '',
    posterUrl: raw.posterUrl || raw.thumbnail || null,
    caption: raw.caption || raw.content || '',
    author: {
      id: author._id || author.id || raw.authorId || '',
      username: author.username || raw.authorName || 'Creator',
      avatar: author.profile?.avatar || author.avatar || null,
      isVerified: author.verification?.isVerified || false,
      isFollowed: raw.isFollowed || false,
    },
    jamId: raw.jamId || null,
    jamTitle: raw.jamTitle || null,
    jamCTA: raw.jamCTA || null,
    createdAt: raw.createdAt || new Date().toISOString(),
    likeCount: raw.likes ?? raw.likeCount ?? 0,
    commentCount: raw.comments ?? raw.commentCount ?? 0,
    shareCount: raw.shares ?? raw.shareCount ?? 0,
    viewCount: raw.views ?? raw.viewCount ?? 0,
    isLiked: raw.liked ?? raw.isLiked ?? false,
    isSaved: raw.bookmarked ?? raw.isSaved ?? false,
  };
}
