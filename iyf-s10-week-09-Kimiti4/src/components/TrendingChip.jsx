import { useState, useEffect } from 'react';
import './TrendingChip.css';

/**
 * 🔥 Trending Floating Chip
 * Draggable chip showing live trending topics
 */
function TrendingChip({ topic = '#JamiiLink', count = 42 }) {
  // Initialize at the bottom-right corner synchronously so the chip never
  // paints stretched across the viewport. Starting at {0,0} combined with the
  // desktop CSS `right`/`bottom` stretched the fixed element full-width/height,
  // then the mount effect snapped it to the corner - a large, deterministic
  // cumulative layout shift on every page.
  const [position, setPosition] = useState(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    return {
      x: Math.max(0, window.innerWidth - 100),
      y: Math.max(0, window.innerHeight - 80)
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - offset.x;
    const newY = e.clientY - offset.y;
    
    // Keep within viewport bounds
    const boundedX = Math.max(0, Math.min(window.innerWidth - 80, newX));
    const boundedY = Math.max(0, Math.min(window.innerHeight - 40, newY));
    
    setPosition({ x: boundedX, y: boundedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, offset]);

  const handleClick = () => {
    if (isDragging) return;
    
    // Navigate to trending topic or open modal
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([10, 5, 10]); // Success pattern
    }
  };

  return (
    <div
      className={`trending-chip ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      role="complementary"
      aria-label={`Trending: ${topic}`}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <span className="chip-icon">🔥</span>
      <span className="chip-topic">{topic}</span>
      <span className="chip-count">{count}</span>
    </div>
  );
}

export default TrendingChip;
