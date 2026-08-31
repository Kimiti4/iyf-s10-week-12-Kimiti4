import { useState, useCallback, useRef, useEffect } from 'react';
import { reelsAPI } from '../services/reelApi';

const IDLE = 'idle';
const LOADING = 'loading';
const LOADED = 'loaded';

/**
 * Manages a vertical swipeable reel feed with viewport-aware playback.
 */
export function useReelFeed(params = {}) {
  const [reels, setReels] = useState([]);
  const [status, setStatus] = useState(IDLE);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const feedRef = useRef(null);
  const paramsRef = useRef(params);

  const fetchReels = useCallback(async (reset = true) => {
    if (reset) {
      setStatus(LOADING);
      setPage(1);
    }

    try {
      const data = await reelsAPI.getAll({ ...paramsRef.current, page: 1, limit: 10 });
      setReels(data.reels);
      setHasMore(data.hasMore);
      setPage(1);
      setStatus(LOADED);
      setActiveIndex(0);
    } catch {
      setStatus(LOADED);
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
    } catch {
      setStatus(LOADED);
    }
  }, [status, hasMore, page]);

  const goToReel = useCallback((index) => {
    if (index >= 0 && index < reels.length) {
      setActiveIndex(index);
      // Load more when approaching the end
      if (index >= reels.length - 3 && hasMore) {
        loadMore();
      }
    }
  }, [reels.length, hasMore, loadMore]);

  const goToNext = useCallback(() => {
    goToReel(activeIndex + 1);
  }, [activeIndex, goToReel]);

  const goToPrevious = useCallback(() => {
    goToReel(activeIndex - 1);
  }, [activeIndex, goToReel]);

  const updateReel = useCallback((reelId, updates) => {
    setReels((prev) => prev.map((r) => (r.id === reelId ? { ...r, ...updates } : r)));
  }, []);

  // Handle scroll-based navigation
  useEffect(() => {
    const container = feedRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const itemHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / itemHeight);
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < reels.length) {
        setActiveIndex(newIndex);
        if (newIndex >= reels.length - 3 && hasMore) {
          loadMore();
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeIndex, reels.length, hasMore, loadMore]);

  return {
    reels,
    status,
    activeIndex,
    hasMore,
    feedRef,
    fetchReels,
    goToReel,
    goToNext,
    goToPrevious,
    updateReel,
  };
}
