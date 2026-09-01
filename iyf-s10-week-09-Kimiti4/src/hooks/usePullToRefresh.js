/**
 * 🔄 Pull to Refresh Hook
 * Implements pull-to-refresh functionality for mobile devices
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export function usePullToRefresh(onRefresh, threshold = 100) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const isPullingRef = useRef(false);
  const startYRef = useRef(0);
  const pullDistanceRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);

  onRefreshRef.current = onRefresh;
  pullDistanceRef.current = pullDistance;

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startYRef.current = e.touches[0].screenY;
        isPullingRef.current = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!isPullingRef.current || window.scrollY > 0) return;

      const currentY = e.touches[0].screenY;
      const distance = currentY - startYRef.current;

      if (distance > 0 && distance < threshold * 2) {
        setPullDistance(distance);
      }
    };

    const handleTouchEnd = () => {
      if (!isPullingRef.current) return;

      isPullingRef.current = false;

      if (pullDistanceRef.current >= threshold) {
        setIsRefreshing(true);
        
        try {
          onRefreshRef.current();
        } catch (error) {
          // Refresh failed
        } finally {
          setTimeout(() => {
            setIsRefreshing(false);
            setPullDistance(0);
          }, 500);
        }
      } else {
        setPullDistance(0);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [threshold]);

  return {
    isRefreshing,
    pullDistance,
    progress: Math.min(pullDistance / threshold, 1)
  };
}

export default usePullToRefresh;
