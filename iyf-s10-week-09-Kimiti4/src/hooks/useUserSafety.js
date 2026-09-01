/**
 * useUserSafety Hook
 *
 * Manages block/mute/restrict state for user safety controls.
 * Follows the optimistic update + rollback pattern.
 *
 * @module hooks/useUserSafety
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { safetyAPI } from '../services/safetyApi';

export function useUserSafety(targetUserId) {
  const [safetyState, setSafetyState] = useState({
    isBlocked: false,
    isBlocking: false,
    isMuted: false,
    isRestricted: false,
    loading: true,
    error: null,
  });
  const pendingRef = useRef(new Set());

  // Load safety status on mount and when target changes
  useEffect(() => {
    if (!targetUserId) return;

    let cancelled = false;
    setSafetyState((s) => ({ ...s, loading: true }));

    safetyAPI.checkStatus(targetUserId)
      .then((status) => {
        if (!cancelled) {
          setSafetyState({ ...status, loading: false, error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSafetyState((s) => ({ ...s, loading: false, error: err.message }));
        }
      });

    return () => { cancelled = true; };
  }, [targetUserId]);

  const handleBlock = useCallback(async () => {
    if (pendingRef.current.has('block')) return;
    pendingRef.current.add('block');

    setSafetyState((s) => ({ ...s, isBlocking: true }));
    try {
      await safetyAPI.block(targetUserId);
      setSafetyState((s) => ({ ...s, isBlocking: true, isMuted: false, isRestricted: false }));
    } catch {
      setSafetyState((s) => ({ ...s, isBlocking: false }));
    } finally {
      pendingRef.current.delete('block');
    }
  }, [targetUserId]);

  const handleUnblock = useCallback(async () => {
    if (pendingRef.current.has('unblock')) return;
    pendingRef.current.add('unblock');

    setSafetyState((s) => ({ ...s, isBlocking: false }));
    try {
      await safetyAPI.unblock(targetUserId);
      setSafetyState((s) => ({ ...s, isBlocking: false }));
    } catch {
      setSafetyState((s) => ({ ...s, isBlocking: true }));
    } finally {
      pendingRef.current.delete('unblock');
    }
  }, [targetUserId]);

  const handleMute = useCallback(async () => {
    if (pendingRef.current.has('mute')) return;
    pendingRef.current.add('mute');

    setSafetyState((s) => ({ ...s, isMuted: true }));
    try {
      await safetyAPI.mute(targetUserId);
      setSafetyState((s) => ({ ...s, isMuted: true }));
    } catch {
      setSafetyState((s) => ({ ...s, isMuted: false }));
    } finally {
      pendingRef.current.delete('mute');
    }
  }, [targetUserId]);

  const handleUnmute = useCallback(async () => {
    if (pendingRef.current.has('unmute')) return;
    pendingRef.current.add('unmute');

    setSafetyState((s) => ({ ...s, isMuted: false }));
    try {
      await safetyAPI.unmute(targetUserId);
      setSafetyState((s) => ({ ...s, isMuted: false }));
    } catch {
      setSafetyState((s) => ({ ...s, isMuted: true }));
    } finally {
      pendingRef.current.delete('unmute');
    }
  }, [targetUserId]);

  const handleRestrict = useCallback(async () => {
    if (pendingRef.current.has('restrict')) return;
    pendingRef.current.add('restrict');

    setSafetyState((s) => ({ ...s, isRestricted: true }));
    try {
      await safetyAPI.restrict(targetUserId);
      setSafetyState((s) => ({ ...s, isRestricted: true }));
    } catch {
      setSafetyState((s) => ({ ...s, isRestricted: false }));
    } finally {
      pendingRef.current.delete('restrict');
    }
  }, [targetUserId]);

  const handleUnrestrict = useCallback(async () => {
    if (pendingRef.current.has('unrestrict')) return;
    pendingRef.current.add('unrestrict');

    setSafetyState((s) => ({ ...s, isRestricted: false }));
    try {
      await safetyAPI.unrestrict(targetUserId);
      setSafetyState((s) => ({ ...s, isRestricted: false }));
    } catch {
      setSafetyState((s) => ({ ...s, isRestricted: true }));
    } finally {
      pendingRef.current.delete('unrestrict');
    }
  }, [targetUserId]);

  return {
    ...safetyState,
    handleBlock,
    handleUnblock,
    handleMute,
    handleUnmute,
    handleRestrict,
    handleUnrestrict,
  };
}
