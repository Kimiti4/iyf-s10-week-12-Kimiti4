import { FaHeart, FaComment, FaEye, FaShare, FaFire, FaUser } from 'react-icons/fa';

const ICONS = {
  likes: FaHeart,
  comments: FaComment,
  views: FaEye,
  shares: FaShare,
  posts: FaFire,
  jams: FaFire,
  followers: FaUser,
};

const COLORS = {
  likes: '#ef4444',
  comments: '#3b82f6',
  views: '#8b5cf6',
  shares: '#10b981',
  posts: '#f59e0b',
  jams: '#ff6b6b',
  followers: '#06b6d4',
};

export default function MetricCard({ label, value, trend, metric = 'views' }) {
  const Icon = ICONS[metric] || FaEye;
  const color = COLORS[metric] || '#6b7280';
  const trendNum = parseFloat(trend);
  const isPositive = trendNum > 0;
  const isNeutral = trendNum === 0 || isNaN(trendNum);

  return (
    <div className="metric-card">
      <div className="metric-card-icon" style={{ background: `${color}15`, color }}>
        <Icon />
      </div>
      <div className="metric-card-body">
        <span className="metric-card-value">{typeof value === 'number' ? value.toLocaleString() : value}</span>
        <span className="metric-card-label">{label}</span>
      </div>
      {!isNeutral && (
        <span className={`metric-card-trend ${isPositive ? 'up' : 'down'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(trendNum)}%
        </span>
      )}
    </div>
  );
}
