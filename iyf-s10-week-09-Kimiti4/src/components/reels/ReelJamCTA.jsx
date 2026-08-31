import { Link } from 'react-router-dom';
import { FaFire } from 'react-icons/fa';

export default function ReelJamCTA({ jamId, jamTitle, jamCTA }) {
  if (!jamId) return null;

  return (
    <Link to={`/jams/${jamId}`} className="reel-jam-cta">
      <FaFire className="reel-jam-cta-icon" aria-hidden="true" />
      <span className="reel-jam-cta-text">
        {jamCTA || `Join: ${jamTitle}`}
      </span>
    </Link>
  );
}
