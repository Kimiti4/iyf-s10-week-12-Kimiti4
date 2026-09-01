import { useRef, useCallback, useEffect } from 'react';
import { useReelPlayback } from '../../hooks/useReelPlayback';
import ReelControls from './ReelControls';
import ReelProgress from './ReelProgress';

export default function ReelPlayer({ reel, isActive, onPause }) {
  const videoRef = useRef(null);
  const {
    isPlaying,
    isMuted,
    progress,
    duration,
    isLoaded,
    togglePlay,
    toggleMute,
    onLoadedData,
  } = useReelPlayback(reel.id, videoRef);

  // Play when active, pause when not
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isActive]);

  // Tap to play/pause
  const handleTap = useCallback((e) => {
    // Don't toggle if clicking on buttons
    if (e.target.closest('.reel-controls') || e.target.closest('.reel-actions')) return;
    togglePlay();
  }, [togglePlay]);

  return (
    <div className="reel-player" onClick={handleTap}>
      <video
        ref={videoRef}
        className="reel-player-video"
        src={reel.videoUrl}
        poster={reel.posterUrl}
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        onLoadedData={onLoadedData}
      />

      {!isLoaded && (
        <div className="reel-player-loading">
          <div className="reel-player-spinner" />
        </div>
      )}

      {!isPlaying && isLoaded && (
        <div className="reel-player-overlay">
          <div className="reel-player-play-icon">▶</div>
        </div>
      )}

      <ReelControls
        isPlaying={isPlaying}
        isMuted={isMuted}
        onTogglePlay={togglePlay}
        onToggleMute={toggleMute}
      />

      <ReelProgress progress={progress} duration={duration} />
    </div>
  );
}
