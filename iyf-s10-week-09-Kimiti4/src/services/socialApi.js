/**
 * Social API Service (Follow/Unfollow)
 *
 * @module services/socialApi
 */

import { request } from './apiClient';

export const followAPI = {
  follow: async (userId) => {
    const data = await request(`/social/follow/${userId}`, { method: 'POST' });
    return data;
  },

  unfollow: async (userId) => {
    const data = await request(`/social/unfollow/${userId}`, { method: 'DELETE' });
    return data;
  },

  checkFollow: async (userId) => {
    try {
      const data = await request(`/social/check-follow/${userId}`);
      return data.isFollowing ?? false;
    } catch {
      return false;
    }
  },

  getFollowers: async (userId, page = 1) => {
    const data = await request(`/social/followers/${userId}?page=${page}`);
    return data;
  },

  getFollowing: async (userId, page = 1) => {
    const data = await request(`/social/following/${userId}?page=${page}`);
    return data;
  },
};
