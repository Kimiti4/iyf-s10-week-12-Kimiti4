/**
 * Creator API Service
 *
 * @module services/creatorApi
 */

import { request } from './apiClient';
import { normalizePosts } from './postApi';

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
