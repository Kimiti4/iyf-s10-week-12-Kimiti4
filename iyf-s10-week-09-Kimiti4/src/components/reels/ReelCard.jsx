import { useState, useCallback } from 'react';
import ReelPlayer from './ReelPlayer';
import ReelCaption from './ReelCaption';
import ReelActions from './ReelActions';
import ReelJamCTA from './ReelJamCTA';
import ReelJamOverlay from '../jam-signature/ReelJamOverlay';
import ShareReelSheet from './ShareReelSheet';
import { useEngagement } from '../../hooks/useEngagement';

export default function ReelCard({ reel, isActive, updateReel }) {
  const [shareOpen, setShareOpen] = useState(false);
  const { handleLike, handleUnlike, handleSave, handleUnsave, handleShare } = useEngagement(updateReel);

  const onLike = useCallback(() => handleLike({ ...reel, type: 'reel' }), [reel, handleLike]);
  const onUnlike = useCallback(() => handleUnlike({ ...reel, type: 'reel' }), [reel, handleUnlike]);
  const onSave = useCallback(() => handleSave({ ...reel, type: 'reel' }), [reel, handleSave]);
  const onUnsave = useCallback(() => handleUnsave({ ...reel, type: 'reel' }), [reel, handleUnsave]);
  const onShare = useCallback(async () => {
    if (navigator.share) {
      await handleShare({ ...reel, type: 'reel' });
    } else {
      setShareOpen(true);
    }
  }, [reel, handleShare]);

  return (
    <article className="reel-card" data-reel-id={reel.id}>
      <ReelPlayer reel={reel} isActive={isActive} />

      <div className="reel-card-sidebar">
        <ReelActions
          reel={reel}
          onLike={onLike}
          onUnlike={onUnlike}
          onSave={onSave}
          onUnsave={onUnsave}
          onShare={onShare}
        />
      </div>

      <div className="reel-card-bottom">
        <ReelCaption reel={reel} />
        <ReelJamCTA jamId={reel.jamId} jamTitle={reel.jamTitle} jamCTA={reel.jamCTA} />
      </div>

      <ReelJamOverlay jamId={reel.jamId} jamTitle={reel.jamTitle} jamCTA={reel.jamCTA} />

      <ShareReelSheet reel={reel} isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </article>
  );
}
