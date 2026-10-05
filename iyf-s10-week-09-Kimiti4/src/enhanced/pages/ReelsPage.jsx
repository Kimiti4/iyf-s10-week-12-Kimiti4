import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHeart, FaComment, FaShare, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { reelsAPI } from '../../services/reelApi';
import './ReelsPage.css';

export default function ReelsPage() {
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [muted, setMuted] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const loadReels = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await reelsAPI.getAll({ limit: 20 });
      setReels(result.reels || []);
    } catch (err) {
      setReels([]);
      setError(err?.message || 'Reels are currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReels();
  }, []);

  const toggleLike = async (reel) => {
    setBusyId(reel.id);
    try {
      const result = reel.isLiked
        ? await reelsAPI.unlike(reel.id)
        : await reelsAPI.like(reel.id);
      setReels((items) => items.map((item) => item.id === reel.id
        ? { ...item, ...result }
        : item));
    } catch (err) {
      setError(err?.message || 'Unable to update the like.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <main className="reels-page" role="main" aria-label="Reels">
        <div className="reels-loading" role="status" aria-live="polite">
          <div className="loading-spinner" aria-hidden="true" />
          <p>Loading reels…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="reels-page" role="main" aria-label="Reels">
        <header className="reels-page-header">
          <button type="button" className="back-button" onClick={() => navigate('/')}>
            <FaArrowLeft aria-hidden="true" /><span>Feed</span>
          </button>
          <h1>Reels</h1>
        </header>
        <div className="reels-error" role="alert">
          <h2>Reels are unavailable</h2>
          <p>{error}</p>
          <button type="button" onClick={loadReels}>Retry</button>
        </div>
      </main>
    );
  }

  if (reels.length === 0) {
    return (
      <main className="reels-page" role="main" aria-label="Reels">
        <header className="reels-page-header">
          <button type="button" className="back-button" onClick={() => navigate('/')}>
            <FaArrowLeft aria-hidden="true" /><span>Feed</span>
          </button>
          <h1>Reels</h1>
        </header>
        <div className="reels-empty">
          <h2>No reels yet</h2>
          <p>Published reels from the community will appear here.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="reels-page" role="main" aria-label="Reels">
      <header className="reels-page-header">
        <button type="button" className="back-button" onClick={() => navigate('/')}>
          <FaArrowLeft aria-hidden="true" /><span>Feed</span>
        </button>
        <h1>Reels</h1>
        <button
          type="button"
          className="sound-toggle"
          aria-label={muted ? 'Unmute reels' : 'Mute reels'}
          aria-pressed={muted}
          onClick={() => setMuted((value) => !value)}
        >
          {muted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
      </header>

      <section className="reels-fullscreen-container" aria-label="Community reels">
        {reels.map((reel) => (
          <article key={reel.id} className="reel-fullscreen-item active">
            <div className="reel-video-background">
              {reel.videoUrl ? (
                <video
                  className="reel-fullscreen-video"
                  src={reel.videoUrl}
                  poster={reel.posterUrl || undefined}
                  controls
                  playsInline
                  muted={muted}
                  preload="metadata"
                  onError={() => setError('This reel could not be played.')}
                />
              ) : reel.posterUrl ? (
                <img src={reel.posterUrl} alt="" className="reel-fullscreen-thumbnail" />
              ) : (
                <div className="reel-video-unavailable">Video unavailable</div>
              )}
            </div>

            <div className="reel-actions-vertical">
              <button
                type="button"
                className="action-item"
                aria-label={reel.isLiked ? 'Unlike reel' : 'Like reel'}
                aria-pressed={reel.isLiked}
                disabled={busyId === reel.id}
                onClick={() => toggleLike(reel)}
              >
                <span className="action-icon-wrapper like-wrapper"><FaHeart /></span>
                <span className="action-count">{reel.likeCount}</span>
              </button>
              <button
                type="button"
                className="action-item"
                aria-label="Open comments"
                onClick={() => navigate('/reels/' + reel.id)}
              >
                <span className="action-icon-wrapper comment-wrapper"><FaComment /></span>
                <span className="action-count">{reel.commentCount}</span>
              </button>
              <button
                type="button"
                className="action-item"
                aria-label="Open reel"
                onClick={() => navigate('/reels/' + reel.id)}
              >
                <span className="action-icon-wrapper share-wrapper"><FaShare /></span>
                <span className="action-count">{reel.shareCount}</span>
              </button>
            </div>

            <div className="reel-info-bottom">
              <div className="reel-author-info">
                {reel.author.avatar ? (
                  <img src={reel.author.avatar} alt="" className="author-avatar-large" />
                ) : (
                  <div className="author-avatar-large" aria-hidden="true">
                    {reel.author.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="author-details">
                  <span className="author-name">@{reel.author.username}</span>
                  {reel.author.isVerified && <span className="verified-badge" aria-label="Verified">✓</span>}
                </div>
              </div>
              <p className="reel-description-full">{reel.caption}</p>
              {reel.jamId && (
                <button type="button" className="follow-button" onClick={() => navigate('/jams/' + reel.jamId)}>
                  {reel.jamCTA || 'View Jam'}
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
