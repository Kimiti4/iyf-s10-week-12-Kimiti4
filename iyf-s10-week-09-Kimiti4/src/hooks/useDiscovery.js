import { useState, useCallback } from 'react';
import { discoveryAPI } from '../services/discoveryApi';

const IDLE = 'idle';
const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

export function useDiscovery() {
  const [searchResults, setSearchResults] = useState({ posts: [], reels: [], jams: [], users: [], hasMore: false });
  const [trending, setTrending] = useState({ posts: [], reels: [], jams: [] });
  const [forYou, setForYou] = useState({ posts: [], reels: [], jams: [], hasMore: false });
  const [categories, setCategories] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const search = useCallback(async (query, type = 'all') => {
    if (!query.trim()) return;
    setStatus(LOADING);
    setError('');
    setSearchQuery(query);
    try {
      const data = await discoveryAPI.search(query, type);
      setSearchResults(data);
      setStatus(LOADED);
    } catch (err) {
      setError(err.message);
      setStatus(ERROR);
    }
  }, []);

  const fetchTrending = useCallback(async (window = '24h') => {
    setStatus(LOADING);
    try {
      const data = await discoveryAPI.getTrending(window);
      setTrending(data);
      setStatus(LOADED);
    } catch (err) {
      setError(err.message);
      setStatus(ERROR);
    }
  }, []);

  const fetchForYou = useCallback(async () => {
    setStatus(LOADING);
    try {
      const data = await discoveryAPI.getForYou();
      setForYou(data);
      setStatus(LOADED);
    } catch (err) {
      setError(err.message);
      setStatus(ERROR);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await discoveryAPI.getCategories();
      setCategories(data);
    } catch {
      // Best-effort
    }
  }, []);

  const fetchSuggestedUsers = useCallback(async () => {
    try {
      const data = await discoveryAPI.getSuggestedUsers();
      setSuggestedUsers(data);
    } catch {
      // Best-effort
    }
  }, []);

  return {
    searchResults,
    trending,
    forYou,
    categories,
    suggestedUsers,
    status,
    error,
    searchQuery,
    search,
    fetchTrending,
    fetchForYou,
    fetchCategories,
    fetchSuggestedUsers,
  };
}
