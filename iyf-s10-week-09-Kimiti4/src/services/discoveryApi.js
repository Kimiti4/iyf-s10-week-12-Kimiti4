/**
 * Discovery API Service
 *
 * @module services/discoveryApi
 */

import { request } from './apiClient';
import { normalizePosts } from './postApi';

export const discoveryAPI = {
  search: async (query, type = 'all', page = 1) => {
    try {
      const data = await request(`/discover/search?q=${encodeURIComponent(query)}&type=${type}&page=${page}`);
      return {
        posts: normalizePosts(data.posts || []),
        reels: data.reels || [],
        jams: data.jams || [],
        users: data.users || [],
        hasMore: data.hasMore ?? false,
      };
    } catch {
      return { posts: [], reels: [], jams: [], users: [], hasMore: false };
    }
  },

  getTrending: async (window = '24h', limit = 20) => {
    try {
      const data = await request(`/discover/trending?window=${window}&limit=${limit}`);
      return {
        posts: normalizePosts(data.posts || []),
        reels: data.reels || [],
        jams: data.jams || [],
      };
    } catch {
      return { posts: [], reels: [], jams: [] };
    }
  },

  getForYou: async (page = 1) => {
    try {
      const data = await request(`/discover/for-you?page=${page}`);
      return {
        posts: normalizePosts(data.posts || []),
        reels: data.reels || [],
        jams: data.jams || [],
        hasMore: data.hasMore ?? false,
      };
    } catch {
      return { posts: [], reels: [], jams: [], hasMore: false };
    }
  },

  getCategories: async () => {
    try {
      const data = await request('/discover/categories');
      return data.categories || data || [];
    } catch {
      return [];
    }
  },

  getSuggestedUsers: async (limit = 10) => {
    try {
      const data = await request(`/discover/suggested-users?limit=${limit}`);
      return data.users || data || [];
    } catch {
      return [];
    }
  },
};
