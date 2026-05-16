/**
 * 📱 Swipe Gestures Hook for Sidebar
 * Implements swipe-to-open/close sidebar on mobile
 */

import { useState, useEffect, useCallback } from 'react';

export function useSwipeGestures(onOpen, onClose, threshold = 100) {
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);

  const handleTouchStart = useCallback((e) => {
    setTouchStartX(e.changedTouches[0].screenX);
  }, []);

  const handleTouchMove = useCallback((e) => {
    setTouchEndX(e.changedTouches[0].screenX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX || !touchEndX) return;

    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    // Swipe left to close (if sidebar is open)
    if (isLeftSwipe && touchStartX < 300) {
      onClose();
    }

    // Swipe right from edge to open (only from left edge)
    if (isRightSwipe && touchStartX < 50) {
      onOpen();
    }

    // Reset
    setTouchStartX(0);
    setTouchEndX(0);
  }, [touchStartX, touchEndX, threshold, onOpen, onClose]);

  useEffect(() => {
    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    touchStartX,
    touchEndX
  };
}

export default useSwipeGestures;
