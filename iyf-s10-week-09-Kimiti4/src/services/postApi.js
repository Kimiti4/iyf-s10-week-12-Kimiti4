/**
 * Post API Service
 *
 * @module services/postApi
 */

import { request } from './apiClient';
import { normalizePost, normalizeComment } from '../contracts/postContract';

export const normalizePosts = (arr) => (Array.isArray(arr) ? arr.map(normalizePost).filter(Boolean) : []);

export const postsAPI = {
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

  getById: async (id) => {
    const data = await request(`/posts/${id}`);
    return normalizePost(data.post || data);
  },

  create: async (postData) => {
    const data = await request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
    return normalizePost(data.post || data);
  },

  update: async (id, postData) => {
    const data = await request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
    return normalizePost(data.post || data);
  },

  delete: async (id) => {
    await request(`/posts/${id}`, { method: 'DELETE' });
  },

  like: async (id) => {
    const data = await request(`/posts/${id}/engage?type=like`, { method: 'PATCH' });
    return { likeCount: data.likes ?? data.likeCount ?? 0, isLiked: true };
  },

  unlike: async (id) => {
    const data = await request(`/posts/${id}/engage?type=unlike`, { method: 'PATCH' });
    return { likeCount: data.likes ?? data.likeCount ?? 0, isLiked: false };
  },

  repost: async (id) => {
    const data = await request(`/posts/${id}/engage?type=repost`, { method: 'PATCH' });
    return { repostCount: data.reblogs ?? data.repostCount ?? 0, isReposted: true };
  },

  unrepost: async (id) => {
    const data = await request(`/posts/${id}/engage?type=unrepost`, { method: 'PATCH' });
    return { repostCount: data.reblogs ?? data.repostCount ?? 0, isReposted: false };
  },

  save: async (id) => {
    await request(`/posts/${id}/save`, { method: 'POST' });
    return { isSaved: true };
  },

  unsave: async (id) => {
    await request(`/posts/${id}/save`, { method: 'DELETE' });
    return { isSaved: false };
  },

  getTrending: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/posts/trending${query ? `?${query}` : ''}`);
    return (data.posts || data || []).map(normalizePost);
  },

  getByAuthor: async (authorId, params = {}) => {
    const query = new URLSearchParams({ author: authorId, ...params }).toString();
    const data = await request(`/posts?${query}`);
    return (data.posts || data || []).map(normalizePost);
  },

  getSaved: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/posts/saved${query ? `?${query}` : ''}`);
    return (data.posts || data || []).map(normalizePost);
  },
};

export const commentsAPI = {
  getByPost: async (postId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/posts/${postId}/comments${query ? `?${query}` : ''}`);
    return (data.comments || data || []).map(normalizeComment);
  },

  create: async (postId, content, parentCommentId = null) => {
    const body = { content };
    if (parentCommentId) body.parentComment = parentCommentId;
    const data = await request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return normalizeComment(data.comment || data);
  },

  delete: async (postId, commentId) => {
    await request(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
  },

  like: async (commentId) => {
    const data = await request(`/comments/${commentId}/like`, { method: 'PATCH' });
    return { likeCount: data.likes ?? data.likeCount ?? 0, isLiked: true };
  },
};
