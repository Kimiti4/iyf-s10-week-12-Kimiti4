/**
 * Distribution Hook
 *
 * Orchestrates Share / Repost / Remix operations with optimistic updates,
 * loading state, error handling, and duplicate-action protection.
 *
 * @module hooks/useDistribution
 */

import { useState, useCallback, useRef } from 'react';
import { distributionAPI } from '../services/distributionApi';
import { canRepost, canRemix, buildShareMeta } from '../domain/distribution/distributionRules';
import { canUseNativeShare } from '../domain/distribution/distributionUtils';
import { trackShare } from '../contracts/socialEventContract';

/**
 * @param {Object} options
 * @param {string} options.currentUserId - Authenticated user ID
 * @param {Function} options.updateItem - Optimistic update callback (id, patch) => void
 * @param {Function} [options.onRemixOpen] - Callback to open remix composer
 */
export function useDistribution({ currentUserId, updateItem, onRemixOpen }) {
  const [shareStatus, setShareStatus] = useState('idle');
  const [repostStatus, setRepostStatus] = useState('idle');
  const [remixStatus, setRemixStatus] = useState('idle');
  const [shareResult, setShareResult] = useState(null);
  const pendingRepostRef = useRef(new Set());

  const share = useCallback(async (item) => {
    if (shareStatus === 'loading') return;
    setShareStatus('loading');
    setShareResult(null);

    const meta = buildShareMeta(item);
    trackShare(item.type, item.id);

    try {
      if (canUseNativeShare()) {
        await navigator.share({ title: meta.title, text: meta.text, url: meta.url });
        setShareResult({ method: 'native', success: true });
      } else {
        await navigator.clipboard.writeText(meta.url);
        setShareResult({ method: 'clipboard', success: true });
      }
      setShareStatus('success');

      distributionAPI.recordShare(item.type, item.id, shareResult?.method || 'link').catch(() => {});
    } catch (err) {
      if (err.name === 'AbortError') {
        setShareStatus('idle');
        return;
      }
      // Fallback: try clipboard if native share failed
      try {
        const meta2 = buildShareMeta(item);
        await navigator.clipboard.writeText(meta2.url);
        setShareResult({ method: 'clipboard', success: true });
        setShareStatus('success');
      } catch {
        setShareStatus('error');
      }
    }
  }, [shareStatus]);

  const repost = useCallback(async (item) => {
    const check = canRepost(item, currentUserId);
    if (!check.allowed) return;

    const itemId = item.id;
    if (pendingRepostRef.current.has(itemId)) return;
    pendingRepostRef.current.add(itemId);

    setRepostStatus('loading');

    // Optimistic update
    updateItem(itemId, {
      isReposted: true,
      repostCount: (item.repostCount || 0) + 1,
    });

    try {
      const result = await distributionAPI.repost(item.type, itemId);
      updateItem(itemId, result);
      setRepostStatus('success');
    } catch {
      // Revert
      updateItem(itemId, {
        isReposted: false,
        repostCount: item.repostCount || 0,
      });
      setRepostStatus('error');
    } finally {
      pendingRepostRef.current.delete(itemId);
    }
  }, [currentUserId, updateItem]);

  const undoRepost = useCallback(async (item) => {
    if (repostStatus === 'loading') return;
    setRepostStatus('loading');

    updateItem(item.id, {
      isReposted: false,
      repostCount: Math.max(0, (item.repostCount || 0) - 1),
    });

    try {
      const result = await distributionAPI.undoRepost(item.type, item.id);
      updateItem(item.id, result);
      setRepostStatus('success');
    } catch {
      updateItem(item.id, {
        isReposted: true,
        repostCount: item.repostCount || 0,
      });
      setRepostStatus('error');
    }
  }, [repostStatus, updateItem]);

  const remix = useCallback(async (item) => {
    const check = canRemix(item, currentUserId);
    if (!check.allowed) return;

    setRemixStatus('loading');

    try {
      if (onRemixOpen) {
        onRemixOpen(item);
      }
      setRemixStatus('success');
    } catch {
      setRemixStatus('error');
    }
  }, [currentUserId, onRemixOpen]);

  return {
    share,
    repost,
    undoRepost,
    remix,
    shareStatus,
    repostStatus,
    remixStatus,
    shareResult,
  };
}
