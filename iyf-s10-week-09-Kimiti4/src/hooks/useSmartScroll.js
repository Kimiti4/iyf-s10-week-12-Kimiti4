import { useState, useEffect } from 'react';

/**
 * 🎯 Smart Scroll Hook for Mobile Sidebar
 * Hides sidebar on scroll down, shows on scroll up
 */
export function useSmartScroll(threshold = 100) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only apply on mobile (< 768px)
      if (window.innerWidth >= 768) {
        setIsVisible(true);
        return;
      }

      // Show sidebar when scrolling UP past threshold
      if (currentScrollY > threshold && currentScrollY < lastScrollY) {
        setIsVisible(true);
      } 
      // Hide when scrolling DOWN aggressively
      else if (currentScrollY > lastScrollY + 50) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, threshold]);

  return isVisible;
}
