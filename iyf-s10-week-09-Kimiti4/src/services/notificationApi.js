/**
 * Notification API Service
 *
 * @module services/notificationApi
 */

import { normalizeNotifications } from '../domain/notifications/normalizeNotification';

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

export const notificationsAPI = {
  /**
   * Get notifications for the current user.
   */
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    try {
      const data = await request(`/notifications${query ? `?${query}` : ''}`);
      const notifications = normalizeNotifications(data.notifications || data || []);
      return {
        notifications,
        unreadCount: data.unreadCount ?? notifications.filter((n) => n.status === 'unread').length,
        hasMore: data.hasMore ?? false,
      };
    } catch {
      // Graceful fallback — backend may not have notifications endpoint yet
      return { notifications: [], unreadCount: 0, hasMore: false };
    }
  },

  /**
   * Get unread count only.
   */
  getUnreadCount: async () => {
    try {
      const data = await request('/notifications/unread-count');
      return data.count ?? data.unreadCount ?? 0;
    } catch {
      return 0;
    }
  },

  /**
   * Mark a notification as read.
   */
  markRead: async (notificationId) => {
    try {
      await request(`/notifications/${notificationId}/read`, { method: 'PATCH' });
    } catch {
      // Best-effort
    }
  },

  /**
   * Mark all notifications as read.
   */
  markAllRead: async () => {
    try {
      await request('/notifications/read-all', { method: 'PATCH' });
    } catch {
      // Best-effort
    }
  },
};
