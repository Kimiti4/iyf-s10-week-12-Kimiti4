import { useState, useCallback, useRef } from 'react';
import { fetchFeedByTab } from '../services/feedApi';
import { rankFeedItems, deduplicateItems, deduplicateContent } from '../domain/feed/feedRanking';
import { FEED_TAB } from '../domain/feed/feedTypes';

const IDLE = 'idle';
const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

export function useUnifiedFeed(userId = null, followedIds = []) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState(FEED_TAB.FOR_YOU);
  const pageRef = useRef(1);
  const followedIdsRef = useRef(followedIds);
  const userIdRef = useRef(userId);

  followedIdsRef.current = followedIds;
  userIdRef.current = userId;

  const fetchFeed = useCallback(async (tab, reset = true) => {
    const currentTab = tab || activeTab;
    if (reset) {
      setStatus(LOADING);
      pageRef.current = 1;
      setHasMore(true);
    }
    setError('');

    try {
      const result = await fetchFeedByTab(currentTab, 1);
      let items = deduplicateItems(result.items);
      items = deduplicateContent(items);
      items = rankFeedItems(items, { userId: userIdRef.current, followedIds: followedIdsRef.current });

      setItems(items);
      setHasMore(result.hasMore);
      pageRef.current = 1;
      setStatus(LOADED);
    } catch (err) {
      setError(err.message || 'Failed to load feed');
      setStatus(ERROR);
    }
  }, [activeTab]);

  const loadMore = useCallback(async () => {
    if (status === LOADING || !hasMore) return;
    setStatus(LOADING);

    try {
      const nextPage = pageRef.current + 1;
      const result = await fetchFeedByTab(activeTab, nextPage);
      let newItems = deduplicateItems([...items, ...result.items]);
      newItems = deduplicateContent(newItems);
      newItems = rankFeedItems(newItems, { userId: userIdRef.current, followedIds: followedIdsRef.current });

      setItems(newItems);
      setHasMore(result.hasMore);
      pageRef.current = nextPage;
      setStatus(LOADED);
    } catch (err) {
      setError(err.message);
      setStatus(ERROR);
    }
  }, [status, hasMore, items, activeTab]);

  const switchTab = useCallback(async (tab) => {
    setActiveTab(tab);
    pageRef.current = 1;
    setHasMore(true);

    try {
      setStatus(LOADING);
      const result = await fetchFeedByTab(tab, 1);
      let items = deduplicateItems(result.items);
      items = deduplicateContent(items);
      items = rankFeedItems(items, { userId: userIdRef.current, followedIds: followedIdsRef.current });

      setItems(items);
      setHasMore(result.hasMore);
      setStatus(LOADED);
    } catch (err) {
      setError(err.message);
      setStatus(ERROR);
    }
  }, []);

  return {
    items,
    status,
    error,
    hasMore,
    activeTab,
    fetchFeed,
    loadMore,
    switchTab,
  };
}
