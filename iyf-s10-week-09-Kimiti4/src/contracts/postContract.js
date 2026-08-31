/**
 * Post Domain Contract
 *
 * Canonical post shape. All components and services must normalize
 * backend responses to this shape before rendering.
 *
 * @module contracts/postContract
 */

// ===== POST STATUS =====

export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  DELETED: 'deleted',
};

// ===== POST CATEGORY =====

export const POST_CATEGORIES = {
  ALL: 'all',
  MTAAI: 'mtaani',
  SKILLS: 'skills',
  FARM: 'farm',
  GIGS: 'gigs',
};

// ===== POST TYPE =====

export const POST_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  LINK: 'link',
};

// ===== SCHEMA CONSTANTS =====

export const POST_TITLE_MAX = 200;
export const POST_CONTENT_MAX = 5000;
export const POST_COMMENT_MAX = 2000;

// ===== NORMALIZED POST SHAPE =====

/**
 * @typedef {Object} NormalizedAuthor
 * @property {string} id
 * @property {string} username
 * @property {string|null} avatar
 * @property {boolean} isVerified
 * @property {boolean} isFollowed
 */

/**
 * @typedef {Object} NormalizedPost
 * @property {string} id
 * @property {string} type - 'text'|'image'|'video'|'link'
 * @property {string} title
 * @property {string} content
 * @property {string|null} image
 * @property {string|null} link
 * @property {NormalizedAuthor} author
 * @property {string} category
 * @property {string[]} tags
 * @property {string} createdAt - ISO 8601
 * @property {string|null} deletedAt
 * @property {number} likeCount
 * @property {number} commentCount
 * @property {number} repostCount
 * @property {number} saveCount
 * @property {boolean} isLiked
 * @property {boolean} isReposted
 * @property {boolean} isSaved
 * @property {string|null} location
 */

// ===== NORMALIZED COMMENT SHAPE =====

/**
 * @typedef {Object} NormalizedComment
 * @property {string} id
 * @property {string} postId
 * @property {string|null} parentCommentId
 * @property {NormalizedAuthor} author
 * @property {string} content
 * @property {number} likeCount
 * @property {boolean} isLiked
 * @property {string} createdAt
 * @property {NormalizedComment[]} replies
 */

// ===== NORMALIZATION FUNCTION =====

/**
 * Normalize a raw API post response to the canonical shape.
 * Handles the inconsistent shapes found across the codebase.
 */
export function normalizePost(raw) {
  if (!raw) return null;

  const author = raw.author || {};
  return {
    id: raw.id || raw._id || '',
    type: inferPostType(raw),
    title: raw.title || '',
    content: raw.content || '',
    image: raw.image || raw.imageUrl || null,
    link: raw.link || null,
    author: {
      id: author._id || author.id || raw.authorId || '',
      username: author.username || raw.authorName || 'Anonymous',
      avatar: author.profile?.avatar || author.avatar || null,
      isVerified: author.verification?.isVerified || false,
      isFollowed: raw.isFollowed || false,
    },
    category: raw.category || POST_CATEGORIES.ALL,
    tags: raw.tags || [],
    createdAt: raw.createdAt || new Date().toISOString(),
    deletedAt: raw.deletedAt || null,
    likeCount: raw.likes ?? raw.likeCount ?? 0,
    commentCount: raw.comments ?? raw.commentCount ?? 0,
    repostCount: raw.reblogs ?? raw.repostCount ?? 0,
    saveCount: raw.saves ?? raw.saveCount ?? 0,
    isLiked: raw.liked ?? raw.isLiked ?? false,
    isReposted: raw.reblogged ?? raw.isReposted ?? false,
    isSaved: raw.bookmarked ?? raw.isSaved ?? false,
    location: raw.location || null,
  };
}

/**
 * Normalize a raw API comment response to the canonical shape.
 */
export function normalizeComment(raw) {
  if (!raw) return null;

  const author = raw.author || {};
  return {
    id: raw.id || raw._id || '',
    postId: raw.postId || '',
    parentCommentId: raw.parentComment || null,
    author: {
      id: author._id || author.id || '',
      username: author.username || 'Anonymous',
      avatar: author.profile?.avatar || author.avatar || null,
      isVerified: author.verification?.isVerified || false,
      isFollowed: false,
    },
    content: raw.content || '',
    likeCount: raw.likes ?? raw.likeCount ?? 0,
    isLiked: raw.liked ?? raw.isLiked ?? false,
    createdAt: raw.createdAt || new Date().toISOString(),
    replies: (raw.replies || []).map(normalizeComment),
  };
}

function inferPostType(raw) {
  if (raw.type) return raw.type;
  if (raw.image || raw.imageUrl) return POST_TYPE.IMAGE;
  if (raw.video || raw.videoUrl) return POST_TYPE.VIDEO;
  if (raw.link) return POST_TYPE.LINK;
  return POST_TYPE.TEXT;
}
