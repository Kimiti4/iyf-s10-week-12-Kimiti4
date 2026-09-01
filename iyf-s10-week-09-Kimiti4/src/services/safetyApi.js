/**
 * User Safety API Service
 *
 * Handles block, mute, restrict, and user safety operations.
 *
 * @module services/safetyApi
 */

import { request } from './apiClient';
import { normalizeSafetyRecord } from '../contracts/moderationContract';

export const safetyAPI = {
  /**
   * Block a user.
   * @param {string} targetUserId
   * @returns {Promise<NormalizedSafetyRecord>}
   */
  async block(targetUserId) {
    const data = await request('/safety/block', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
    return normalizeSafetyRecord(data.record || data);
  },

  /**
   * Unblock a user.
   * @param {string} targetUserId
   * @returns {Promise<void>}
   */
  async unblock(targetUserId) {
    await request(`/safety/block/${targetUserId}`, { method: 'DELETE' });
  },

  /**
   * Mute a user.
   * @param {string} targetUserId
   * @returns {Promise<NormalizedSafetyRecord>}
   */
  async mute(targetUserId) {
    const data = await request('/safety/mute', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
    return normalizeSafetyRecord(data.record || data);
  },

  /**
   * Unmute a user.
   * @param {string} targetUserId
   * @returns {Promise<void>}
   */
  async unmute(targetUserId) {
    await request(`/safety/mute/${targetUserId}`, { method: 'DELETE' });
  },

  /**
   * Restrict a user (limits their interactions without them knowing).
   * @param {string} targetUserId
   * @returns {Promise<NormalizedSafetyRecord>}
   */
  async restrict(targetUserId) {
    const data = await request('/safety/restrict', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
    return normalizeSafetyRecord(data.record || data);
  },

  /**
   * Unrestrict a user.
   * @param {string} targetUserId
   * @returns {Promise<void>}
   */
  async unrestrict(targetUserId) {
    await request(`/safety/restrict/${targetUserId}`, { method: 'DELETE' });
  },

  /**
   * Get list of blocked users.
   * @returns {Promise<NormalizedSafetyRecord[]>}
   */
  async getBlockedUsers() {
    const data = await request('/safety/blocked');
    return (data.users || data.blocked || []).map(normalizeSafetyRecord);
  },

  /**
   * Get list of muted users.
   * @returns {Promise<NormalizedSafetyRecord[]>}
   */
  async getMutedUsers() {
    const data = await request('/safety/muted');
    return (data.users || data.muted || []).map(normalizeSafetyRecord);
  },

  /**
   * Get list of restricted users.
   * @returns {Promise<NormalizedSafetyRecord[]>}
   */
  async getRestrictedUsers() {
    const data = await request('/safety/restricted');
    return (data.users || data.restricted || []).map(normalizeSafetyRecord);
  },

  /**
   * Check safety status between current user and a target user.
   * @param {string} targetUserId
   * @returns {Promise<{ isBlocked, isBlocking, isMuted, isRestricted }>}
   */
  async checkStatus(targetUserId) {
    const data = await request(`/safety/status/${targetUserId}`);
    return {
      isBlocked: data.isBlocked ?? false,
      isBlocking: data.isBlocking ?? false,
      isMuted: data.isMuted ?? false,
      isRestricted: data.isRestricted ?? false,
    };
  },

  /**
   * Get content status for a specific item.
   * @param {string} targetType - post|reel|jam|comment
   * @param {string} targetId
   * @returns {Promise<{ status, reportCount }>}
   */
  async getContentStatus(targetType, targetId) {
    const data = await request(`/safety/content-status/${targetType}/${targetId}`);
    return {
      status: data.status || 'active',
      reportCount: data.reportCount || 0,
    };
  },
};
