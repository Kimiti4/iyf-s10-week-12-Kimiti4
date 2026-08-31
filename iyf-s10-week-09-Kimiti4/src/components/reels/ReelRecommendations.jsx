import { Link } from 'react-router-dom';
import { FaFire } from 'react-icons/fa';

export default function ReelRecommendations({ reel, relatedJams = [] }) {
  if (!reel && relatedJams.length === 0) return null;

  return (
    <div className="reel-recommendations">
      {reel?.jamId && (
        <Link to={`/jams/${reel.jamId}`} className="reel-recommendations-jam">
          <FaFire className="reel-recommendations-jam-icon" />
          <div>
            <p className="reel-recommendations-jam-label">Related Jam</p>
            <p className="reel-recommendations-jam-title">{reel.jamTitle || 'View this Jam'}</p>
          </div>
        </Link>
      )}

      {relatedJams.length > 0 && (
        <div className="reel-recommendations-list">
          <p className="reel-recommendations-heading">Related Jams</p>
          {relatedJams.map((jam) => (
            <Link
              key={jam.id || jam._id}
              to={`/jams/${jam.id || jam._id}`}
              className="reel-recommendations-item"
            >
              <FaFire className="reel-recommendations-item-icon" />
              <span>{jam.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
