import { Link } from 'react-router-dom';
import { FaFire, FaArrowRight } from 'react-icons/fa';

export default function JamCTA({ jamId, jamTitle, variant = 'default', className = '' }) {
  if (!jamId) return null;

  return (
    <Link
      to={`/jams/${jamId}`}
      className={`jam-cta jam-cta--${variant} ${className}`}
    >
      <FaFire className="jam-cta-icon" />
      <span className="jam-cta-text">
        {jamTitle || 'Join this Jam'}
      </span>
      <FaArrowRight className="jam-cta-arrow" />
    </Link>
  );
}
