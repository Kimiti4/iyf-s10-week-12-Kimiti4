/**
 * Generic engagement hook for posts and reels.
 * Consolidates like/unlike/save/share logic that was duplicated
 * across usePostActions, ReelCard, and ReelDetailPage.
 *
 * @module hooks/useEngagement
 */

import { useCallback } from 'react';
import { postsAPI } from '../services/postApi';
import { reelsAPI } from '../services/reelApi';
import {
  trackLike,
  trackUnlike,
  trackRepost,
  trackShare,
  trackSave,
  trackUnsave,
} from '../contracts/socialEventContract';

const APIs = {
  post: postsAPI,
  reel: reelsAPI,
};

export function useEngagement(updateItem) {
  const handleLike = useCallback(async (item) => {
    const api = APIs[item.type] || APIs.post;
    updateItem(item.id, { isLiked: true, likeCount: (item.likeCount || 0) + 1 });
    trackLike(item.type, item.id);
    try {
      const result = await api.like(item.id);
      updateItem(item.id, result);
    } catch {
      updateItem(item.id, { isLiked: false, likeCount: item.likeCount || 0 });
    }
  }, [updateItem]);

  const handleUnlike = useCallback(async (item) => {
    const api = APIs[item.type] || APIs.post;
    updateItem(item.id, { isLiked: false, likeCount: Math.max(0, (item.likeCount || 0) - 1) });
    trackUnlike(item.type, item.id);
    try {
      const result = await api.unlike(item.id);
      updateItem(item.id, result);
    } catch {
      updateItem(item.id, { isLiked: true, likeCount: item.likeCount || 0 });
    }
  }, [updateItem]);

  const handleRepost = useCallback(async (item) => {
    if (item.type !== 'post') return;
    updateItem(item.id, { isReposted: true, repostCount: (item.repostCount || 0) + 1 });
    trackRepost(item.id);
    try {
      const result = await postsAPI.repost(item.id);
      updateItem(item.id, result);
    } catch {
      updateItem(item.id, { isReposted: false, repostCount: item.repostCount || 0 });
    }
  }, [updateItem]);

  const handleUnrepost = useCallback(async (item) => {
    if (item.type !== 'post') return;
    updateItem(item.id, { isReposted: false, repostCount: Math.max(0, (item.repostCount || 0) - 1) });
    try {
      const result = await postsAPI.unrepost(item.id);
      updateItem(item.id, result);
    } catch {
      updateItem(item.id, { isReposted: true, repostCount: item.repostCount || 0 });
    }
  }, [updateItem]);

  const handleSave = useCallback(async (item) => {
    const api = APIs[item.type] || APIs.post;
    updateItem(item.id, { isSaved: true });
    trackSave(item.type, item.id);
    try {
      await api.save(item.id);
    } catch {
      updateItem(item.id, { isSaved: false });
    }
  }, [updateItem]);

  const handleUnsave = useCallback(async (item) => {
    const api = APIs[item.type] || APIs.post;
    updateItem(item.id, { isSaved: false });
    trackUnsave(item.type, item.id);
    try {
      await api.unsave(item.id);
    } catch {
      updateItem(item.id, { isSaved: true });
    }
  }, [updateItem]);

  const handleShare = useCallback(async (item) => {
    trackShare(item.type, item.id);
    const path = item.type === 'reel' ? `/reels/${item.id}` : `/posts/${item.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title || item.caption?.slice(0, 100) || 'Check this out',
          url: `${window.location.origin}${path}`,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
    }
  }, []);

  return {
    handleLike,
    handleUnlike,
    handleRepost,
    handleUnrepost,
    handleSave,
    handleUnsave,
    handleShare,
  };
}
