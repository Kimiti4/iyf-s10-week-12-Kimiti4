import { useState, useCallback, useRef, useEffect } from 'react';
import { reelsAPI } from '../services/reelApi';

const IDLE = 'idle';
const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

export function useReels(initialParams = {}) {
  const [reels, setReels] = useState([]);
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const paramsRef = useRef(initialParams);

  const fetchReels = useCallback(async (params = {}, reset = true) => {
    paramsRef.current = params;
    if (reset) {
      setStatus(LOADING);
      setPage(1);
      setHasMore(true);
    }
    setError('');

    try {
      const data = await reelsAPI.getAll({ ...params, page: 1, limit: 10 });
      setReels(data.reels);
      setHasMore(data.hasMore);
      setPage(1);
      setStatus(LOADED);
    } catch (err) {
      setError(err.message || 'Failed to load reels');
      setStatus(ERROR);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (status === LOADING || !hasMore) return;
    setStatus(LOADING);

    try {
      const nextPage = page + 1;
      const data = await reelsAPI.getAll({ ...paramsRef.current, page: nextPage, limit: 10 });
      setReels((prev) => [...prev, ...data.reels]);
      setHasMore(data.hasMore);
      setPage(nextPage);
      setStatus(LOADED);
    } catch (err) {
      setError(err.message);
      setStatus(ERROR);
    }
  }, [status, hasMore, page]);

  const updateReel = useCallback((reelId, updates) => {
    setReels((prev) => prev.map((r) => (r.id === reelId ? { ...r, ...updates } : r)));
  }, []);

  return { reels, status, error, hasMore, fetchReels, loadMore, updateReel };
}
