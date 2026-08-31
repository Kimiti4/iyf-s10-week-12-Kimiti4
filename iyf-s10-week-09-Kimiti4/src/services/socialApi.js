/**
 * Social API Service
 *
 * Handles follow/unfollow and social graph operations.
 *
 * @module services/socialApi
 */

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

// ===== FOLLOW API =====

export const followAPI = {
  /**
   * Follow a user.
   */
  follow: async (userId) => {
    const data = await request(`/users/${userId}/follow`, {
      method: 'POST',
    });
    return {
      isFollowed: true,
      followerCount: data.followerCount ?? data.followers ?? 0,
    };
  },

  /**
   * Unfollow a user.
   */
  unfollow: async (userId) => {
    const data = await request(`/users/${userId}/follow`, {
      method: 'DELETE',
    });
    return {
      isFollowed: false,
      followerCount: data.followerCount ?? data.followers ?? 0,
    };
  },

  /**
   * Get followers of a user.
   */
  getFollowers: async (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users/${userId}/followers${query ? `?${query}` : ''}`);
  },

  /**
   * Get users that a user is following.
   */
  getFollowing: async (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users/${userId}/following${query ? `?${query}` : ''}`);
  },

  /**
   * Check if the current user follows a target user.
   */
  checkFollow: async (userId) => {
    try {
      const data = await request(`/users/${userId}/follow/check`);
      return data.isFollowed || false;
    } catch {
      return false;
    }
  },
};
