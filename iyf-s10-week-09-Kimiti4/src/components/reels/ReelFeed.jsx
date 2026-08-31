import ReelCard from './ReelCard';
import { useReelFeed } from '../../hooks/useReelFeed';
import { FaSpinner } from 'react-icons/fa';

export default function ReelFeed({ params = {}, emptyMessage = 'No reels yet' }) {
  const {
    reels,
    status,
    activeIndex,
    hasMore,
    feedRef,
    fetchReels,
    updateReel,
  } = useReelFeed(params);

  if (status === 'loading' && reels.length === 0) {
    return (
      <div className="reel-feed-loading">
        <FaSpinner className="reel-feed-spinner" />
      </div>
    );
  }

  if (status === 'loaded' && reels.length === 0) {
    return (
      <div className="reel-feed-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="reel-feed" ref={feedRef}>
      {reels.map((reel, index) => (
        <ReelCard
          key={reel.id}
          reel={reel}
          isActive={index === activeIndex}
          updateReel={updateReel}
        />
      ))}

      {hasMore && status === 'loading' && (
        <div className="reel-feed-load-more">
          <FaSpinner className="reel-feed-spinner" />
        </div>
      )}
    </div>
  );
}
