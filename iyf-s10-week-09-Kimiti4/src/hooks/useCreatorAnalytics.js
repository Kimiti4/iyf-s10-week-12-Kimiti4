/**
 * J-019: Creator Analytics Hook
 *
 * Tracks and displays creator-level analytics.
 */

import { useState, useEffect, useCallback } from 'react';
import { getCreatorStats, getCreatorTimeSeries } from '../services/analyticsApi';

export default function useCreatorAnalytics(userId, { range = 'month', enabled = true } = {}) {
  const [stats, setStats] = useState(null);
  const [timeSeries, setTimeSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    if (!userId || !enabled) return;

    setLoading(true);
    setError(null);
    try {
      const [s, ts] = await Promise.all([
        getCreatorStats(userId),
        getCreatorTimeSeries(userId, { range, metric: 'engagement' }),
      ]);
      setStats(s);
      setTimeSeries(ts);
    } catch (err) {
      setError(err.message || 'Failed to load creator analytics');
    } finally {
      setLoading(false);
    }
  }, [userId, range, enabled]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    stats,
    timeSeries,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}
