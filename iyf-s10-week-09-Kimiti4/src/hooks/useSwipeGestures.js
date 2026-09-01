/**
 * 📱 Swipe Gestures Hook for Sidebar
 * Implements swipe-to-open/close sidebar on mobile
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export function useSwipeGestures(onOpen, onClose, threshold = 100) {
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const touchStartRef = useRef(0);
  const touchEndRef = useRef(0);

  onOpenRef.current = onOpen;
  onCloseRef.current = onClose;

  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartRef.current = e.changedTouches[0].screenX;
    };

    const handleTouchMove = (e) => {
      touchEndRef.current = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = () => {
      const startX = touchStartRef.current;
      const endX = touchEndRef.current;
      if (!startX || !endX) return;

      const distance = startX - endX;
      const isLeftSwipe = distance > threshold;
      const isRightSwipe = distance < -threshold;

      if (isLeftSwipe && startX < 300) {
        onCloseRef.current();
      }
      if (isRightSwipe && startX < 50) {
        onOpenRef.current();
      }

      touchStartRef.current = 0;
      touchEndRef.current = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [threshold]);

  return {
    touchStartX,
    touchEndX
  };
}

export default useSwipeGestures;
