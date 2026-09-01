import { formatDuration } from '../../utils/formatTime';

export default function ReelProgress({ progress = 0, duration = 0 }) {
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
          {formatDuration(duration * (progress / 100))} / {formatDuration(duration)}
        </span>
      )}
    </div>
  );
}
