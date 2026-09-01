/**
 * useModeration Hook
 *
 * Admin/moderator-facing hook for moderation queue and actions.
 *
 * @module hooks/useModeration
 */

import { useState, useCallback } from 'react';
import { moderationAPI } from '../services/moderationApi';
import { STATUS } from '../utils/constants';

export function useModeration() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const fetchQueue = useCallback(async (params = {}) => {
    setStatus(STATUS.LOADING);
    setError(null);
    try {
      const result = await moderationAPI.getQueue({
        page: pagination.page,
        limit: pagination.limit,
        ...params,
      });
      setReports(result.reports);
      setPagination((p) => ({ ...p, total: result.total }));
      setStatus(STATUS.LOADED);
    } catch (err) {
      setError(err.message);
      setStatus(STATUS.ERROR);
    }
  }, [pagination.page, pagination.limit]);

  const fetchStats = useCallback(async () => {
    try {
      const result = await moderationAPI.getStats();
      setStats(result);
    } catch {
      // Stats are non-critical
    }
  }, []);

  const takeAction = useCallback(async (reportId, actionPayload) => {
    try {
      const updated = await moderationAPI.takeAction(reportId, actionPayload);
      setReports((prev) => prev.map((r) => (r.id === reportId ? updated : r)));
      return updated;
    } catch (err) {
      throw err;
    }
  }, []);

  const setPage = useCallback((page) => {
    setPagination((p) => ({ ...p, page }));
  }, []);

  return {
    reports,
    stats,
    status,
    error,
    pagination,
    fetchQueue,
    fetchStats,
    takeAction,
    setPage,
  };
}
