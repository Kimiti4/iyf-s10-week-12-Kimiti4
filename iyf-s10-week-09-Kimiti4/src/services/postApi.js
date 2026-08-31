/**
 * Post API Service
 *
 * Handles all Post-related HTTP requests. Uses the shared request
 * helper pattern. Normalizes all responses through postContract.
 *
 * @module services/postApi
 */

import { normalizePost, normalizeComment } from '../contracts/postContract';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    throw new Error('Session expired. Please login again.');
  }

  if (response.status === 404) {
    throw new Error('Not found.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
};

// ===== POSTS API =====

export const postsAPI = {
  /**
   * Get posts for the feed.
   * @param {Object} params - { category, search, page, limit, sort }
   */
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/posts${query ? `?${query}` : ''}`);
    const posts = data.posts || data || [];
    return {
      posts: posts.map(normalizePost),
      total: data.total || posts.length,
      page: data.page || 1,
      hasMore: data.hasMore ?? false,
    };
  },

  /**
   * Get a single post by ID.
   */
  getById: async (id) => {
    const data = await request(`/posts/${id}`);
    return normalizePost(data.post || data);
  },

  /**
   * Create a new post.
   * @param {Object} postData - { title, content, category, location, tags, image }
   */
  create: async (postData) => {
    const data = await request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
    return normalizePost(data.post || data);
  },

  /**
   * Update a post.
   */
  update: async (id, postData) => {
    const data = await request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
    return normalizePost(data.post || data);
  },

  /**
   * Delete a post (soft delete).
   */
  delete: async (id) => {
    await request(`/posts/${id}`, { method: 'DELETE' });
  },

  /**
   * Like a post.
   */
  like: async (id) => {
    const data = await request(`/posts/${id}/engage?type=like`, {
      method: 'PATCH',
    });
    return {
      likeCount: data.likes ?? data.likeCount ?? 0,
      isLiked: true,
    };
  },

  /**
   * Unlike a post.
   */
  unlike: async (id) => {
    const data = await request(`/posts/${id}/engage?type=unlike`, {
      method: 'PATCH',
    });
    return {
      likeCount: data.likes ?? data.likeCount ?? 0,
      isLiked: false,
    };
  },

  /**
   * Repost/share a post.
   */
  repost: async (id) => {
    const data = await request(`/posts/${id}/engage?type=repost`, {
      method: 'PATCH',
    });
    return {
      repostCount: data.reblogs ?? data.repostCount ?? 0,
      isReposted: true,
    };
  },

  /**
   * Undo repost.
   */
  unrepost: async (id) => {
    const data = await request(`/posts/${id}/engage?type=unrepost`, {
      method: 'PATCH',
    });
    return {
      repostCount: data.reblogs ?? data.repostCount ?? 0,
      isReposted: false,
    };
  },

  /**
   * Save/bookmark a post.
   */
  save: async (id) => {
    await request(`/posts/${id}/save`, { method: 'POST' });
    return { isSaved: true };
  },

  /**
   * Unsave a post.
   */
  unsave: async (id) => {
    await request(`/posts/${id}/save`, { method: 'DELETE' });
    return { isSaved: false };
  },

  /**
   * Get trending posts.
   */
  getTrending: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/posts/trending${query ? `?${query}` : ''}`);
    const posts = data.posts || data || [];
    return posts.map(normalizePost);
  },

  /**
   * Get posts by a specific author.
   */
  getByAuthor: async (authorId, params = {}) => {
    const query = new URLSearchParams({ author: authorId, ...params }).toString();
    const data = await request(`/posts?${query}`);
    const posts = data.posts || data || [];
    return posts.map(normalizePost);
  },

  /**
   * Get saved/bookmarked posts.
   */
  getSaved: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/posts/saved${query ? `?${query}` : ''}`);
    const posts = data.posts || data || [];
    return posts.map(normalizePost);
  },
};

// ===== COMMENTS API =====

export const commentsAPI = {
  /**
   * Get comments for a post.
   */
  getByPost: async (postId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/posts/${postId}/comments${query ? `?${query}` : ''}`);
    const comments = data.comments || data || [];
    return comments.map(normalizeComment);
  },

  /**
   * Create a comment on a post.
   */
  create: async (postId, content, parentCommentId = null) => {
    const body = { content };
    if (parentCommentId) body.parentComment = parentCommentId;
    const data = await request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return normalizeComment(data.comment || data);
  },

  /**
   * Delete a comment.
   */
  delete: async (postId, commentId) => {
    await request(`/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Like a comment.
   */
  like: async (commentId) => {
    const data = await request(`/comments/${commentId}/like`, {
      method: 'PATCH',
    });
    return {
      likeCount: data.likes ?? data.likeCount ?? 0,
      isLiked: true,
    };
  },
};
