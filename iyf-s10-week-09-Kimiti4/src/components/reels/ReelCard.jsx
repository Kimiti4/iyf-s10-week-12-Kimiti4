import { useCallback } from 'react';
import ReelPlayer from './ReelPlayer';
import ReelCaption from './ReelCaption';
import ReelActions from './ReelActions';
import ReelJamCTA from './ReelJamCTA';
import { reelsAPI } from '../../services/reelApi';
import { trackLike, trackUnlike, trackShare, trackSave, trackUnsave } from '../../contracts/socialEventContract';

export default function ReelCard({ reel, isActive, updateReel }) {
  const handleLike = useCallback(async () => {
    updateReel(reel.id, { isLiked: true, likeCount: reel.likeCount + 1 });
    trackLike('reel', reel.id);
    try {
      const result = await reelsAPI.like(reel.id);
      updateReel(reel.id, result);
    } catch {
      updateReel(reel.id, { isLiked: false, likeCount: reel.likeCount });
    }
  }, [reel, updateReel]);

  const handleUnlike = useCallback(async () => {
    updateReel(reel.id, { isLiked: false, likeCount: Math.max(0, reel.likeCount - 1) });
    trackUnlike('reel', reel.id);
    try {
      const result = await reelsAPI.unlike(reel.id);
      updateReel(reel.id, result);
    } catch {
      updateReel(reel.id, { isLiked: true, likeCount: reel.likeCount });
    }
  }, [reel, updateReel]);

  const handleSave = useCallback(async () => {
    updateReel(reel.id, { isSaved: true });
    trackSave('reel', reel.id);
    try {
      await reelsAPI.save(reel.id);
    } catch {
      updateReel(reel.id, { isSaved: false });
    }
  }, [reel, updateReel]);

  const handleUnsave = useCallback(async () => {
    updateReel(reel.id, { isSaved: false });
    trackUnsave('reel', reel.id);
    try {
      await reelsAPI.unsave(reel.id);
    } catch {
      updateReel(reel.id, { isSaved: true });
    }
  }, [reel, updateReel]);

  const handleShare = useCallback(async () => {
    trackShare('reel', reel.id);
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.caption?.slice(0, 100) || 'Reel',
          url: `${window.location.origin}/reels/${reel.id}`,
        });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${window.location.origin}/reels/${reel.id}`);
    }
  }, [reel]);

  return (
    <article className="reel-card" data-reel-id={reel.id}>
      <ReelPlayer reel={reel} isActive={isActive} />

      <div className="reel-card-sidebar">
        <ReelActions
          reel={reel}
          onLike={handleLike}
          onUnlike={handleUnlike}
          onSave={handleSave}
          onUnsave={handleUnsave}
          onShare={handleShare}
        />
      </div>

      <div className="reel-card-bottom">
        <ReelCaption reel={reel} />
        <ReelJamCTA jamId={reel.jamId} jamTitle={reel.jamTitle} jamCTA={reel.jamCTA} />
      </div>
    </article>
  );
}
