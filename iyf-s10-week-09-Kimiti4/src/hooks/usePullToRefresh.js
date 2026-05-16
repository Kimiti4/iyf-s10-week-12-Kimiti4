/**
 * 🔄 Pull to Refresh Hook
 * Implements pull-to-refresh functionality for mobile devices
 */

import { useState, useEffect, useCallback } from 'react';

export function usePullToRefresh(onRefresh, threshold = 100) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const handleTouchStart = useCallback((e) => {
    // Only trigger if at top of page
    if (window.scrollY === 0) {
      setStartY(e.touches[0].screenY);
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling || window.scrollY > 0) return;

    const currentY = e.touches[0].screenY;
    const distance = currentY - startY;

    // Only track positive pull (downward)
    if (distance > 0 && distance < threshold * 2) {
      setPullDistance(distance);
    }
  }, [isPulling, startY, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    setIsPulling(false);

    // Check if pulled far enough to trigger refresh
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        // Reset after animation
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      // Snap back if not pulled far enough
      setPullDistance(0);
    }
  }, [isPulling, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isRefreshing,
    pullDistance,
    progress: Math.min(pullDistance / threshold, 1)
  };
}

export default usePullToRefresh;
