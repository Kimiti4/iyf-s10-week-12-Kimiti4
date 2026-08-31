/**
 * Reel API Service
 *
 * Handles short-form video HTTP requests.
 *
 * @module services/reelApi
 */

import { normalizeReel } from '../contracts/reelContract';

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

export const reelsAPI = {
  /**
   * Get reels for the feed.
   * @param {Object} params - { page, limit, jamId }
   */
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

  /**
   * Get a single reel.
   */
  getById: async (id) => {
    const data = await request(`/reels/${id}`);
    return normalizeReel(data.reel || data);
  },

  /**
   * Create a reel.
   */
  create: async (reelData) => {
    const data = await request('/reels', {
      method: 'POST',
      body: JSON.stringify(reelData),
    });
    return normalizeReel(data.reel || data);
  },

  /**
   * Like a reel.
   */
  like: async (id) => {
    const data = await request(`/reels/${id}/like`, { method: 'POST' });
    return { likeCount: data.likes ?? data.likeCount ?? 0, isLiked: true };
  },

  /**
   * Unlike a reel.
   */
  unlike: async (id) => {
    const data = await request(`/reels/${id}/like`, { method: 'DELETE' });
    return { likeCount: data.likes ?? data.likeCount ?? 0, isLiked: false };
  },

  /**
   * Save a reel.
   */
  save: async (id) => {
    await request(`/reels/${id}/save`, { method: 'POST' });
    return { isSaved: true };
  },

  /**
   * Unsave a reel.
   */
  unsave: async (id) => {
    await request(`/reels/${id}/save`, { method: 'DELETE' });
    return { isSaved: false };
  },

  /**
   * Record a view.
   */
  recordView: async (id) => {
    await request(`/reels/${id}/view`, { method: 'POST' });
  },

  /**
   * Record watch completion.
   */
  recordCompletion: async (id) => {
    await request(`/reels/${id}/complete`, { method: 'POST' });
  },

  /**
   * Get reels for a specific Jam.
   */
  getByJam: async (jamId, params = {}) => {
    const query = new URLSearchParams({ jamId, ...params }).toString();
    const data = await request(`/reels?${query}`);
    const reels = data.reels || data || [];
    return reels.map(normalizeReel);
  },

  /**
   * Get reels by a creator.
   */
  getByCreator: async (creatorId, params = {}) => {
    const query = new URLSearchParams({ author: creatorId, ...params }).toString();
    const data = await request(`/reels?${query}`);
    const reels = data.reels || data || [];
    return reels.map(normalizeReel);
  },
};
