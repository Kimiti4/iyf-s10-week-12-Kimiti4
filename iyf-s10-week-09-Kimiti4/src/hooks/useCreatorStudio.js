import { useState, useCallback, useEffect } from 'react';
import { creatorAPI } from '../services/creatorApi';
import { computeCreatorMetrics } from '../domain/creator/creatorMetrics';

const IDLE = 'idle';
const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

export function useCreatorStudio() {
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [jams, setJams] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [analytics, setAnalytics] = useState({ views: [], engagement: [], followers: [], topContent: [] });
  const [drafts, setDrafts] = useState([]);
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');

  const computedMetrics = computeCreatorMetrics(posts, jams, reels);

  const fetchDashboard = useCallback(async () => {
    setStatus(LOADING);
    setError('');
    try {
      const data = await creatorAPI.getDashboard();
      setPosts(data.posts);
      setReels(data.reels);
      setJams(data.jams);
      setMetrics(data.metrics);
      setStatus(LOADED);
    } catch (err) {
      setError(err.message);
      setStatus(ERROR);
    }
  }, []);

  const fetchAnalytics = useCallback(async (period = '7d') => {
    try {
      const data = await creatorAPI.getAnalytics(period);
      setAnalytics(data);
    } catch {
      // Best-effort
    }
  }, []);

  const fetchDrafts = useCallback(async () => {
    try {
      const data = await creatorAPI.getDrafts();
      setDrafts(data);
    } catch {
      // Best-effort
    }
  }, []);

  const deleteDraft = useCallback(async (draftId) => {
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    await creatorAPI.deleteDraft(draftId);
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    posts,
    reels,
    jams,
    metrics: { ...metrics, ...computedMetrics },
    analytics,
    drafts,
    status,
    error,
    fetchDashboard,
    fetchAnalytics,
    fetchDrafts,
    deleteDraft,
  };
}
