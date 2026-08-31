import { Link } from 'react-router-dom';
import { FaFire, FaArrowRight } from 'react-icons/fa';

export default function ReelJamOverlay({ jamId, jamTitle, jamCTA }) {
  if (!jamId) return null;

  return (
    <Link to={`/jams/${jamId}`} className="reel-jam-overlay">
      <div className="reel-jam-overlay-content">
        <FaFire className="reel-jam-overlay-icon" />
        <div>
          <p className="reel-jam-overlay-title">{jamTitle || 'Related Jam'}</p>
          <p className="reel-jam-overlay-cta">{jamCTA || 'Join this Jam'}</p>
        </div>
        <FaArrowRight className="reel-jam-overlay-arrow" />
      </div>
    </Link>
  );
}
