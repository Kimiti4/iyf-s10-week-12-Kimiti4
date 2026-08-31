import MetricCard from './MetricCard';
import { computeTrend } from '../../domain/creator/creatorMetrics';

export default function MetricsBar({ metrics }) {
  const items = [
    { label: 'Total Views', value: metrics.totalViews || 0, metric: 'views', trend: computeTrend(metrics.totalViews, 0) },
    { label: 'Total Likes', value: metrics.totalLikes || 0, metric: 'likes', trend: computeTrend(metrics.totalLikes, 0) },
    { label: 'Total Comments', value: metrics.totalComments || 0, metric: 'comments', trend: computeTrend(metrics.totalComments, 0) },
    { label: 'Total Shares', value: metrics.totalShares || 0, metric: 'shares', trend: computeTrend(metrics.totalShares, 0) },
    { label: 'Posts', value: metrics.totalPosts || 0, metric: 'posts', trend: '' },
    { label: 'Active Jams', value: metrics.activeJams || 0, metric: 'jams', trend: '' },
  ];

  return (
    <div className="metrics-bar">
      {items.map((item) => (
        <MetricCard key={item.label} {...item} />
      ))}
    </div>
  );
}
