import { Link } from 'react-router-dom';
import { FaFire, FaArrowRight } from 'react-icons/fa';

export default function FeedJamBanner({ jams = [] }) {
  const activeJams = jams.filter((j) => j.status === 'active' || j.status === 'recruiting').slice(0, 3);

  if (activeJams.length === 0) return null;

  return (
    <div className="feed-jam-banner">
      <div className="feed-jam-banner-header">
        <FaFire className="feed-jam-banner-icon" />
        <span>Active Jams</span>
      </div>
      <div className="feed-jam-banner-list">
        {activeJams.map((jam) => (
          <Link
            key={jam.id || jam._id}
            to={`/jams/${jam.id || jam._id}`}
            className="feed-jam-banner-item"
          >
            <span className="feed-jam-banner-item-title">{jam.title}</span>
            <FaArrowRight className="feed-jam-banner-item-arrow" />
          </Link>
        ))}
      </div>
      <Link to="/jams" className="feed-jam-banner-more">
        View all Jams →
      </Link>
    </div>
  );
}
