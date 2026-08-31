/**
 * Reel API Service
 *
 * @module services/reelApi
 */

import { request } from './apiClient';
import { normalizeReel } from '../contracts/reelContract';

export const reelsAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/reels${query ? `?${query}` : ''}`);
    const reels = data.reels || data || [];
    return {
      reels: reels.map(normalizeReel),
      total: data.total || reels.length,
      hasMore: data.hasMore ?? false,
    };
  },

  getById: async (id) => {
    const data = await request(`/reels/${id}`);
    return normalizeReel(data.reel || data);
  },

  create: async (reelData) => {
    const data = await request('/reels', {
      method: 'POST',
      body: JSON.stringify(reelData),
    });
    return normalizeReel(data.reel || data);
  },

  like: async (id) => {
    const data = await request(`/reels/${id}/like`, { method: 'POST' });
    return { likeCount: data.likes ?? data.likeCount ?? 0, isLiked: true };
  },

  unlike: async (id) => {
    const data = await request(`/reels/${id}/like`, { method: 'DELETE' });
    return { likeCount: data.likes ?? data.likeCount ?? 0, isLiked: false };
  },

  save: async (id) => {
    await request(`/reels/${id}/save`, { method: 'POST' });
    return { isSaved: true };
  },

  unsave: async (id) => {
    await request(`/reels/${id}/save`, { method: 'DELETE' });
    return { isSaved: false };
  },

  recordView: async (id) => {
    await request(`/reels/${id}/view`, { method: 'POST' });
  },

  recordCompletion: async (id) => {
    await request(`/reels/${id}/complete`, { method: 'POST' });
  },

  getByJam: async (jamId, params = {}) => {
    const query = new URLSearchParams({ jamId, ...params }).toString();
    const data = await request(`/reels?${query}`);
    return (data.reels || data || []).map(normalizeReel);
  },

  getByCreator: async (creatorId, params = {}) => {
    const query = new URLSearchParams({ author: creatorId, ...params }).toString();
    const data = await request(`/reels?${query}`);
    return (data.reels || data || []).map(normalizeReel);
  },
};
