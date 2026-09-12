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
    // R4 [M1]: backend returns {success,count,total,pages,currentPage,data:[]}.
    // Read the canonical `data` array with fallbacks; never treat the envelope
    // object itself as the list. hasMore/page derived truthfully.
    const posts = data.data ?? data.posts ?? (Array.isArray(data) ? data : []);
    const page = data.page ?? data.currentPage ?? 1;
    const pages = data.pages ?? 1;
    return {
      posts: normalizePosts(posts),
      total: data.total ?? posts.length,
      page,
      hasMore: data.hasMore ?? (page < pages),
    };
  },

  getById: async (id) => {
    const data = await request(`/posts/${id}`);
    return normalizePost(data.data ?? data.post ?? data);
  },

  create: async (postData) => {
    const data = await request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
    return normalizePost(data.data ?? data.post ?? data);
  },

  update: async (id, postData) => {
    const data = await request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
    return normalizePost(data.data ?? data.post ?? data);
  },

  delete: async (id) => {
    await request(`/posts/${id}`, { method: 'DELETE' });
  },

  like: async (id) => {
    const data = await request(`/posts/${id}/engage?type=like`, { method: 'PATCH' });
    // R4: backend returns {success, data: post} with post.likes.
    return { likeCount: data.data?.likes ?? data.likes ?? data.likeCount ?? 0, isLiked: true };
  },

  unlike: async (id) => {
    const data = await request(`/posts/${id}/engage?type=unlike`, { method: 'PATCH' });
    return { likeCount: data.data?.likes ?? data.likes ?? data.likeCount ?? 0, isLiked: false };
  },

  repost: async (id) => {
    const data = await request(`/posts/${id}/engage?type=repost`, { method: 'PATCH' });
    return { repostCount: data.data?.reposts ?? data.reblogs ?? data.repostCount ?? 0, isReposted: true };
  },

  unrepost: async (id) => {
    const data = await request(`/posts/${id}/engage?type=unrepost`, { method: 'PATCH' });
    return { repostCount: data.data?.reposts ?? data.reblogs ?? data.repostCount ?? 0, isReposted: false };
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
    // R4: backend returns {success,count,data:[]} — read data.data first.
    return normalizePosts(data.data ?? data.posts ?? data ?? []);
  },

  getByAuthor: async (authorId, params = {}) => {
    const query = new URLSearchParams({ author: authorId, ...params }).toString();
    const data = await request(`/posts?${query}`);
    return normalizePosts(data.data ?? data.posts ?? data ?? []);
  },

  getSaved: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/posts/saved${query ? `?${query}` : ''}`);
    return normalizePosts(data.data ?? data.posts ?? data ?? []);
  },
};

export const commentsAPI = {
  getByPost: async (postId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/posts/${postId}/comments${query ? `?${query}` : ''}`);
    // R4: backend returns {success,postId,count,data:[]} — read data.data first.
    return (data.data ?? data.comments ?? data ?? []).map(normalizeComment);
  },

  create: async (postId, content, parentCommentId = null) => {
    const body = { content };
    if (parentCommentId) body.parentComment = parentCommentId;
    const data = await request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return normalizeComment(data.data ?? data.comment ?? data);
  },

  delete: async (postId, commentId) => {
    await request(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
  },

  like: async (commentId, postId) => {
    // R3 [P1-9 U3]: nested post-scoped path (replaces the unmatched
    // flat /comments/:commentId/like which has no backend route).
    const data = await request(`/posts/${postId}/comments/${commentId}/like`, { method: 'PATCH' });
    return { likeCount: data.data?.likes ?? data.likes ?? data.likeCount ?? 0, isLiked: true };
  },
};
