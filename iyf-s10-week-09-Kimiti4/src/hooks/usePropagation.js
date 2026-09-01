/**
 * J-019: Content Propagation Hook
 *
 * Tracks and displays propagation metrics for a piece of content.
 */

import { useState, useEffect, useCallback } from 'react';
import { getContentPropagation, getContentTimeSeries } from '../services/analyticsApi';
import { computeViralityScore, computeEngagementRate } from '../domain/analytics/analyticsTypes';

export default function usePropagation(contentId, { range = 'week', enabled = true } = {}) {
  const [propagation, setPropagation] = useState(null);
  const [timeSeries, setTimeSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPropagation = useCallback(async () => {
    if (!contentId || !enabled) return;

    setLoading(true);
    setError(null);
    try {
      const [prop, series] = await Promise.all([
        getContentPropagation(contentId),
        getContentTimeSeries(contentId, { range }),
      ]);

      // Enrich with computed scores
      const enriched = {
        ...prop,
        viralityScore: computeViralityScore({
          views: prop.views,
          shares: prop.shares,
          remixes: prop.remixes,
          createdAt: prop.createdAt,
        }),
        engagementRate: computeEngagementRate({
          views: prop.views,
          likes: prop.likes,
          comments: prop.comments,
          shares: prop.shares,
          saves: prop.saves,
        }),
      };

      setPropagation(enriched);
      setTimeSeries(series);
    } catch (err) {
      setError(err.message || 'Failed to load propagation data');
    } finally {
      setLoading(false);
    }
  }, [contentId, range, enabled]);

  useEffect(() => {
    fetchPropagation();
  }, [fetchPropagation]);

  return {
    propagation,
    timeSeries,
    loading,
    error,
    refetch: fetchPropagation,
  };
}
