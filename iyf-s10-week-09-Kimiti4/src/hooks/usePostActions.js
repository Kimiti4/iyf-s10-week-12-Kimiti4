import { useCallback } from 'react';
import { postsAPI } from '../services/postApi';
import {
  trackLike,
  trackUnlike,
  trackRepost,
  trackShare,
  trackSave,
  trackUnsave,
} from '../contracts/socialEventContract';

export function usePostActions(updatePost) {
  const handleLike = useCallback(async (post) => {
    // Optimistic update
    updatePost(post.id, {
      isLiked: true,
      likeCount: post.likeCount + 1,
    });
    trackLike('post', post.id);

    try {
      const result = await postsAPI.like(post.id);
      updatePost(post.id, result);
    } catch {
      // Revert
      updatePost(post.id, {
        isLiked: false,
        likeCount: post.likeCount,
      });
    }
  }, [updatePost]);

  const handleUnlike = useCallback(async (post) => {
    updatePost(post.id, {
      isLiked: false,
      likeCount: Math.max(0, post.likeCount - 1),
    });
    trackUnlike('post', post.id);

    try {
      const result = await postsAPI.unlike(post.id);
      updatePost(post.id, result);
    } catch {
      updatePost(post.id, {
        isLiked: true,
        likeCount: post.likeCount,
      });
    }
  }, [updatePost]);

  const handleRepost = useCallback(async (post) => {
    updatePost(post.id, {
      isReposted: true,
      repostCount: post.repostCount + 1,
    });
    trackRepost(post.id);

    try {
      const result = await postsAPI.repost(post.id);
      updatePost(post.id, result);
    } catch {
      updatePost(post.id, {
        isReposted: false,
        repostCount: post.repostCount,
      });
    }
  }, [updatePost]);

  const handleUnrepost = useCallback(async (post) => {
    updatePost(post.id, {
      isReposted: false,
      repostCount: Math.max(0, post.repostCount - 1),
    });

    try {
      const result = await postsAPI.unrepost(post.id);
      updatePost(post.id, result);
    } catch {
      updatePost(post.id, {
        isReposted: true,
        repostCount: post.repostCount,
      });
    }
  }, [updatePost]);

  const handleSave = useCallback(async (post) => {
    updatePost(post.id, { isSaved: true });
    trackSave('post', post.id);

    try {
      await postsAPI.save(post.id);
    } catch {
      updatePost(post.id, { isSaved: false });
    }
  }, [updatePost]);

  const handleUnsave = useCallback(async (post) => {
    updatePost(post.id, { isSaved: false });
    trackUnsave('post', post.id);

    try {
      await postsAPI.unsave(post.id);
    } catch {
      updatePost(post.id, { isSaved: true });
    }
  }, [updatePost]);

  const handleShare = useCallback(async (post) => {
    trackShare('post', post.id);

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || post.content?.slice(0, 100),
          url: `${window.location.origin}/posts/${post.id}`,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(
        `${window.location.origin}/posts/${post.id}`
      );
    }
  }, []);

  const handleDelete = useCallback(async (post) => {
    try {
      await postsAPI.delete(post.id);
      return true;
    } catch {
      return false;
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
    handleDelete,
  };
}
