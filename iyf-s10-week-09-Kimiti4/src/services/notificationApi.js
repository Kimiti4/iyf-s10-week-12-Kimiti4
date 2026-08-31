/**
 * Notification API Service
 *
 * @module services/notificationApi
 */

import { request } from './apiClient';
import { normalizeNotifications } from '../domain/notifications/normalizeNotification';

export const notificationsAPI = {
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
      return { notifications: [], unreadCount: 0, hasMore: false };
    }
  },

  getUnreadCount: async () => {
    try {
      const data = await request('/notifications/unread-count');
      return data.count ?? data.unreadCount ?? 0;
    } catch {
      return 0;
    }
  },

  markRead: async (notificationId) => {
    try {
      await request(`/notifications/${notificationId}/read`, { method: 'PATCH' });
    } catch {
      // Best-effort
    }
  },

  markAllRead: async () => {
    try {
      await request('/notifications/read-all', { method: 'PATCH' });
    } catch {
      // Best-effort
    }
  },
};
