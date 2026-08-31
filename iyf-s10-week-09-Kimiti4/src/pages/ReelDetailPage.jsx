import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import ReelPlayer from '../components/reels/ReelPlayer';
import ReelCaption from '../components/reels/ReelCaption';
import ReelActions from '../components/reels/ReelActions';
import ReelJamCTA from '../components/reels/ReelJamCTA';
import { reelsAPI } from '../services/reelApi';
import { normalizeReel } from '../contracts/reelContract';
import { trackLike, trackUnlike, trackShare, trackSave, trackUnsave } from '../contracts/socialEventContract';
import '../components/reels/reels.css';

const IDLE = 'idle';
const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

export default function ReelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reel, setReel] = useState(null);
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');

  const fetchReel = useCallback(async () => {
    setStatus(LOADING);
    try {
      const data = await reelsAPI.getById(id);
      setReel(data);
      setStatus(LOADED);
    } catch (err) {
      setError(err.message || 'Failed to load reel');
      setStatus(ERROR);
    }
  }, [id]);

  useEffect(() => {
    fetchReel();
  }, [fetchReel]);

  const updateReel = useCallback((updates) => {
    setReel((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  const handleLike = useCallback(async () => {
    if (!reel) return;
    updateReel({ isLiked: true, likeCount: reel.likeCount + 1 });
    trackLike('reel', reel.id);
    try {
      const result = await reelsAPI.like(reel.id);
      updateReel(result);
    } catch {
      updateReel({ isLiked: false, likeCount: reel.likeCount });
    }
  }, [reel, updateReel]);

  const handleUnlike = useCallback(async () => {
    if (!reel) return;
    updateReel({ isLiked: false, likeCount: Math.max(0, reel.likeCount - 1) });
    trackUnlike('reel', reel.id);
    try {
      const result = await reelsAPI.unlike(reel.id);
      updateReel(result);
    } catch {
      updateReel({ isLiked: true, likeCount: reel.likeCount });
    }
  }, [reel, updateReel]);

  const handleSave = useCallback(async () => {
    if (!reel) return;
    updateReel({ isSaved: true });
    trackSave('reel', reel.id);
    try { await reelsAPI.save(reel.id); } catch { updateReel({ isSaved: false }); }
  }, [reel, updateReel]);

  const handleUnsave = useCallback(async () => {
    if (!reel) return;
    updateReel({ isSaved: false });
    trackUnsave('reel', reel.id);
    try { await reelsAPI.unsave(reel.id); } catch { updateReel({ isSaved: true }); }
  }, [reel, updateReel]);

  const handleShare = useCallback(async () => {
    if (!reel) return;
    trackShare('reel', reel.id);
    if (navigator.share) {
      try { await navigator.share({ title: reel.caption?.slice(0, 100), url: window.location.href }); } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  }, [reel]);

  if (status === LOADING) {
    return (
      <div className="reel-detail-page">
        <div className="reel-feed-loading"><div className="reel-feed-spinner" /></div>
      </div>
    );
  }

  if (status === ERROR || !reel) {
    return (
      <div className="reel-detail-page">
        <div className="reel-detail-header">
          <button className="reel-detail-back" onClick={() => navigate(-1)}><FaArrowLeft /></button>
          <span className="reel-detail-title">Reel</span>
        </div>
        <div style={{ padding: '2rem', color: '#fff', textAlign: 'center' }}>
          {error || 'Not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="reel-detail-page">
      <header className="reel-detail-header">
        <button className="reel-detail-back" onClick={() => navigate(-1)} aria-label="Go back">
          <FaArrowLeft />
        </button>
        <span className="reel-detail-title">Reel</span>
      </header>

      <div style={{ position: 'relative', height: 'calc(100vh - 60px)' }}>
        <ReelPlayer reel={reel} isActive={true} />

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
      </div>
    </div>
  );
}
