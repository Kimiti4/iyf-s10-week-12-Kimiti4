export default function ReelProgress({ progress, duration }) {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="reel-progress" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="reel-progress-bar">
        <div className="reel-progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>
      {duration > 0 && (
        <span className="reel-progress-time">
          {formatTime(progress * duration)} / {formatTime(duration)}
        </span>
      )}
    </div>
  );
}
