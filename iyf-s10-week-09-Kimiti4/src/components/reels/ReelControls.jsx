import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

export default function ReelControls({ isPlaying, isMuted, onTogglePlay, onToggleMute }) {
  return (
    <div className="reel-controls">
      <button
        className="reel-controls-play"
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>

      <button
        className="reel-controls-mute"
        onClick={onToggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
      </button>
    </div>
  );
}
