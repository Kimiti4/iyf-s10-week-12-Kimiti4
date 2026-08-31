import { Link } from 'react-router-dom';
import { FaFire, FaUsers, FaClock } from 'react-icons/fa';

export default function JamInlineCard({ jam }) {
  if (!jam) return null;

  const statusColors = {
    recruiting: '#10b981',
    active: '#ff6b6b',
    completed: '#6b7280',
  };

  return (
    <Link to={`/jams/${jam.id || jam._id}`} className="jam-inline-card">
      <div className="jam-inline-card-header">
        <FaFire className="jam-inline-card-icon" />
        <span className="jam-inline-card-title">{jam.title}</span>
      </div>
      {jam.description && (
        <p className="jam-inline-card-desc">{jam.description.substring(0, 80)}</p>
      )}
      <div className="jam-inline-card-meta">
        {jam.status && (
          <span
            className="jam-inline-card-status"
            style={{ color: statusColors[jam.status] || '#6b7280' }}
          >
            {jam.status}
          </span>
        )}
        {jam.participants && (
          <span><FaUsers /> {jam.participants}</span>
        )}
        {jam.endDate && (
          <span><FaClock /> {formatEndDate(jam.endDate)}</span>
        )}
      </div>
    </Link>
  );
}

function formatEndDate(dateString) {
  const end = new Date(dateString);
  const now = new Date();
  const diff = end - now;
  if (diff < 0) return 'Ended';
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Ends today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}
