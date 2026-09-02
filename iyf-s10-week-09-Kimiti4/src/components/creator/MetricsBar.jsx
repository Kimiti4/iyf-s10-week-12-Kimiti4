import AnalyticsCard from '../analytics/AnalyticsCard';
import { FaHeart, FaComment, FaEye, FaShare, FaFire, FaUser } from 'react-icons/fa';
import { computeTrend } from '../../domain/creator/creatorMetrics';

const ICON_MAP = {
  views: <FaEye />,
  likes: <FaHeart />,
  comments: <FaComment />,
  shares: <FaShare />,
  posts: <FaFire />,
  jams: <FaFire />,
  followers: <FaUser />,
};

export default function MetricsBar({ metrics }) {
  const items = [
    { label: 'Total Views', value: metrics.totalViews || 0, metric: 'views', trend: computeTrend(metrics.totalViews, 0) },
    { label: 'Total Likes', value: metrics.totalLikes || 0, metric: 'likes', trend: computeTrend(metrics.totalLikes, 0) },
    { label: 'Total Comments', value: metrics.totalComments || 0, metric: 'comments', trend: computeTrend(metrics.totalComments, 0) },
    { label: 'Total Shares', value: metrics.totalShares || 0, metric: 'shares', trend: computeTrend(metrics.totalShares, 0) },
    { label: 'Posts', value: metrics.totalPosts || 0, metric: 'posts', trend: null },
    { label: 'Active Jams', value: metrics.activeJams || 0, metric: 'jams', trend: null },
  ];

  return (
    <div className="metrics-bar">
      {items.map((item) => (
        <AnalyticsCard
          key={item.label}
          label={item.label}
          value={item.value}
          trend={item.trend}
          icon={ICON_MAP[item.metric]}
        />
      ))}
    </div>
  );
}
