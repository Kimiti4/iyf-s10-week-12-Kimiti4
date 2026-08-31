import { useState, useCallback, useRef } from 'react';
import { postsAPI } from '../services/postApi';

const IDLE = 'idle';
const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

export function usePosts(initialParams = {}) {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const paramsRef = useRef(initialParams);

  const fetchPosts = useCallback(async (params = {}, reset = true) => {
    paramsRef.current = params;
    if (reset) {
      setStatus(LOADING);
      setPage(1);
      setHasMore(true);
    }
    setError('');

    try {
      const data = await postsAPI.getAll({ ...params, page: 1, limit: 20 });
      setPosts(data.posts);
      setHasMore(data.hasMore);
      setPage(1);
      setStatus(LOADED);
    } catch (err) {
      setError(err.message || 'Failed to load posts');
      setStatus(ERROR);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (status === LOADING || !hasMore) return;
    setStatus(LOADING);

    try {
      const nextPage = page + 1;
      const data = await postsAPI.getAll({ ...paramsRef.current, page: nextPage, limit: 20 });
      setPosts((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      setPage(nextPage);
      setStatus(LOADED);
    } catch (err) {
      setError(err.message || 'Failed to load more');
      setStatus(ERROR);
    }
  }, [status, hasMore, page]);

  const updatePost = useCallback((postId, updates) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, ...updates } : p))
    );
  }, []);

  const addPost = useCallback((post) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const removePost = useCallback((postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  return {
    posts,
    status,
    error,
    hasMore,
    fetchPosts,
    loadMore,
    updatePost,
    addPost,
    removePost,
  };
}
