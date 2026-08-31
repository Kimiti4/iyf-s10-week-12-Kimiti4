export default function ReelProgress({ progress = 0, duration = 0 }) {
  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <div className="reel-progress-bar" aria-label={`Progress: ${Math.round(progress)}%`}>
      <div className="reel-progress-track">
        <div
          className="reel-progress-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {duration > 0 && (
        <span className="reel-progress-time">
          {formatTime(duration * (progress / 100))} / {formatTime(duration)}
        </span>
      )}
    </div>
  );
}
