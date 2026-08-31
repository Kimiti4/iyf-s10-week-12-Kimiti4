/**
 * Discovery API Service
 *
 * @module services/discoveryApi
 */

import { normalizePosts } from './postApi';

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
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }
  return data;
};

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
