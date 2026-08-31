import { useState } from 'react';
import { FaFire } from 'react-icons/fa';
import { TRENDING_WINDOW } from '../../domain/discovery/discoveryTypes';

const WINDOWS = [
  { value: TRENDING_WINDOW.HOUR, label: '1H' },
  { value: TRENDING_WINDOW.DAY, label: '24H' },
  { value: TRENDING_WINDOW.WEEK, label: '7D' },
  { value: TRENDING_WINDOW.MONTH, label: '30D' },
];

export default function TrendingSection({ trending, onWindowChange }) {
  const [activeWindow, setActiveWindow] = useState(TRENDING_WINDOW.DAY);

  const handleWindow = (value) => {
    setActiveWindow(value);
    onWindowChange?.(value);
  };

  const items = [
    ...(trending.posts || []).map((p) => ({ ...p, _type: 'post' })),
    ...(trending.reels || []).map((r) => ({ ...r, _type: 'reel' })),
    ...(trending.jams || []).map((j) => ({ ...j, _type: 'jam' })),
  ].sort((a, b) => (b.score || b.likeCount || b.viewCount || 0) - (a.score || a.likeCount || a.viewCount || 0));

  return (
    <div className="trending-section">
      <div className="trending-header">
        <FaFire className="trending-icon" />
        <h2>Trending</h2>
        <div className="trending-windows">
          {WINDOWS.map((w) => (
            <button
              key={w.value}
              className={`trending-window ${activeWindow === w.value ? 'active' : ''}`}
              onClick={() => handleWindow(w.value)}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="trending-empty">Nothing trending right now</p>
      ) : (
        <div className="trending-list">
          {items.slice(0, 10).map((item, i) => (
            <div key={item.id || item._id || i} className="trending-item">
              <span className="trending-rank">#{i + 1}</span>
              <div className="trending-info">
                <p className="trending-title">
                  {item.title || item.caption?.substring(0, 60) || item.name || 'Untitled'}
                </p>
                <span className="trending-meta">
                  {item._type === 'post' && '📝 Post'}
                  {item._type === 'reel' && '🎬 Reel'}
                  {item._type === 'jam' && '🔥 Jam'}
                  {' · '}
                  {formatCount(item.score || item.likeCount || item.viewCount || 0)} engagements
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatCount(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
