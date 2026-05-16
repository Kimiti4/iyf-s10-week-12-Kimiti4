import { useState, useEffect } from 'react';
import './TrendingChip.css';

/**
 * 🔥 Trending Floating Chip
 * Draggable chip showing live trending topics
 */
function TrendingChip({ topic = '#JamiiLink', count = 42 }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Initialize position (bottom-right)
  useEffect(() => {
    setPosition({
      x: window.innerWidth - 100,
      y: window.innerHeight - 80
    });
  }, []);

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
    console.log(`Clicked trending: ${topic}`);
    
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
