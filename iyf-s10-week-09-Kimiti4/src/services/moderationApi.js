/**
 * Moderation API Service
 *
 * Handles reporting, moderation queue, and moderation actions.
 * All responses normalized through moderationContract.
 *
 * @module services/moderationApi
 */

import { request } from './apiClient';
import {
  normalizeReport,
  normalizeModerationLog,
} from '../contracts/moderationContract';

export const moderationAPI = {
  /**
   * Submit a content report.
   * @param {{ targetType, targetId, reason, description }} payload
   * @returns {Promise<NormalizedReport>}
   */
  async report(payload) {
    const data = await request('/moderation/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeReport(data.report || data);
  },

  /**
   * Get reports submitted by the current user.
   * @param {Object} params - { page, limit }
   * @returns {Promise<{ reports: NormalizedReport[], total: number }>}
   */
  async getMyReports(params = {}) {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/moderation/reports/mine${query ? `?${query}` : ''}`);
    return {
      reports: (data.reports || []).map(normalizeReport),
      total: data.total || 0,
    };
  },

  /**
   * Get moderation queue (admin/moderator only).
   * @param {Object} params - { status, page, limit, severity }
   * @returns {Promise<{ reports: NormalizedReport[], total: number }>}
   */
  async getQueue(params = {}) {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/moderation/queue${query ? `?${query}` : ''}`);
    return {
      reports: (data.reports || []).map(normalizeReport),
      total: data.total || 0,
    };
  },

  /**
   * Get a single report by ID.
   * @param {string} reportId
   * @returns {Promise<NormalizedReport>}
   */
  async getReport(reportId) {
    const data = await request(`/moderation/reports/${reportId}`);
    return normalizeReport(data.report || data);
  },

  /**
   * Take action on a report (admin/moderator only).
   * @param {string} reportId
   * @param {{ action, note, contentStatus }} payload
   * @returns {Promise<NormalizedReport>}
   */
  async takeAction(reportId, payload) {
    const data = await request(`/moderation/reports/${reportId}/action`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return normalizeReport(data.report || data);
  },

  /**
   * Get moderation action logs (admin only).
   * @param {Object} params - { targetType, targetId, page, limit }
   * @returns {Promise<{ logs: NormalizedModerationLog[], total: number }>}
   */
  async getLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const data = await request(`/moderation/logs${query ? `?${query}` : ''}`);
    return {
      logs: (data.logs || []).map(normalizeModerationLog),
      total: data.total || 0,
    };
  },

  /**
   * Get moderation stats (admin only).
   * @returns {Promise<{ pending: number, reviewing: number, resolved: number, total: number }>}
   */
  async getStats() {
    const data = await request('/moderation/stats');
    return data;
  },
};
