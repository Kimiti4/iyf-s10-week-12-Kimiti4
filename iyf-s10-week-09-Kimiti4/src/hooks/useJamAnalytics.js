/**
 * J-019: Jam Participation Hook
 *
 * Tracks and displays participation metrics for a Jam.
 */

import { useState, useEffect, useCallback } from 'react';
import { getJamParticipation, getJamLeaderboard } from '../services/analyticsApi';

export default function useJamAnalytics(jamId, { enabled = true } = {}) {
  const [participation, setParticipation] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    if (!jamId || !enabled) return;

    setLoading(true);
    setError(null);
    try {
      const [part, board] = await Promise.all([
        getJamParticipation(jamId),
        getJamLeaderboard(jamId, { limit: 10 }),
      ]);
      setParticipation(part);
      setLeaderboard(board);
    } catch (err) {
      setError(err.message || 'Failed to load jam analytics');
    } finally {
      setLoading(false);
    }
  }, [jamId, enabled]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    participation,
    leaderboard,
    loading,
    error,
    refetch: fetchAnalytics,
  };
}
