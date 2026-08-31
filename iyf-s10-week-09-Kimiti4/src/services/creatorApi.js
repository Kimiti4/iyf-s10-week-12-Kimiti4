/**
 * Creator API Service
 *
 * @module services/creatorApi
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

export const creatorAPI = {
  getDashboard: async () => {
    try {
      const data = await request('/creator/dashboard');
      return {
        posts: normalizePosts(data.posts || []),
        reels: data.reels || [],
        jams: data.jams || [],
        metrics: data.metrics || {},
        recentActivity: data.recentActivity || [],
      };
    } catch {
      return { posts: [], reels: [], jams: [], metrics: {}, recentActivity: [] };
    }
  },

  getAnalytics: async (period = '7d') => {
    try {
      const data = await request(`/creator/analytics?period=${period}`);
      return {
        views: data.views || [],
        engagement: data.engagement || [],
        followers: data.followers || [],
        topContent: data.topContent || [],
      };
    } catch {
      return { views: [], engagement: [], followers: [], topContent: [] };
    }
  },

  getDrafts: async () => {
    try {
      const data = await request('/creator/drafts');
      return normalizePosts(data.drafts || data || []);
    } catch {
      return [];
    }
  },

  deleteDraft: async (draftId) => {
    try {
      await request(`/creator/drafts/${draftId}`, { method: 'DELETE' });
    } catch {
      // Best-effort
    }
  },
};
