import { useState, useCallback } from 'react';
import { followAPI } from '../services/socialApi';
import { trackFollow, trackUnfollow } from '../contracts/socialEventContract';

export function useFollow(userId, initialIsFollowed = false) {
  const [isFollowed, setIsFollowed] = useState(initialIsFollowed);
  const [loading, setLoading] = useState(false);

  const follow = useCallback(async () => {
    if (loading || !userId) return;
    setLoading(true);

    // Optimistic
    setIsFollowed(true);
    trackFollow(userId);

    try {
      await followAPI.follow(userId);
    } catch {
      setIsFollowed(false);
    } finally {
      setLoading(false);
    }
  }, [userId, loading]);

  const unfollow = useCallback(async () => {
    if (loading || !userId) return;
    setLoading(true);

    setIsFollowed(false);
    trackUnfollow(userId);

    try {
      await followAPI.unfollow(userId);
    } catch {
      setIsFollowed(true);
    } finally {
      setLoading(false);
    }
  }, [userId, loading]);

  const toggle = useCallback(() => {
    if (isFollowed) {
      unfollow();
    } else {
      follow();
    }
  }, [isFollowed, follow, unfollow]);

  return {
    isFollowed,
    loading,
    follow,
    unfollow,
    toggle,
  };
}
