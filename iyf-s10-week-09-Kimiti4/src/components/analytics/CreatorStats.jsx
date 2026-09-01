/**
 * J-019: Creator Stats Component
 *
 * Shows creator-level analytics dashboard.
 * Displays content counts, total engagement, follower growth, and top content.
 */

import { FaPen, FaVideo, FaUsers, FaChartBar } from 'react-icons/fa';
import AnalyticsCard from './AnalyticsCard';
import MiniChart from './MiniChart';
import useCreatorAnalytics from '../../hooks/useCreatorAnalytics';
import '../../styles/Analytics.css';

export default function CreatorStats({ userId, compact = false }) {
  const { stats, timeSeries, loading, error } = useCreatorAnalytics(userId);

  if (loading) {
    return (
      <div className="analytics-section analytics-section--loading">
        <div className="analytics-skeleton" />
      </div>
    );
  }

  if (error || !stats) {
    return null;
  }

  return (
    <div className="analytics-section">
      <div className="analytics-section__header">
        <h4 className="analytics-section__title">Creator Analytics</h4>
      </div>

      <div className={`analytics-grid ${compact ? 'analytics-grid--compact' : ''}`}>
        <AnalyticsCard
          label="Posts"
          value={stats.totalPosts}
          icon={<FaPen />}
          compact={compact}
        />
        <AnalyticsCard
          label="Reels"
          value={stats.totalReels}
          icon={<FaVideo />}
          compact={compact}
        />
        <AnalyticsCard
          label="Jams"
          value={stats.totalJams}
          icon={<FaUsers />}
          compact={compact}
        />
        <AnalyticsCard
          label="Avg Engagement"
          value={stats.avgEngagementRate}
          type="rate"
          icon={<FaChartBar />}
          compact={compact}
        />
      </div>

      {!compact && timeSeries.length > 0 && (
        <div className="analytics-chart">
          <MiniChart data={timeSeries} height={80} />
        </div>
      )}

      {!compact && stats.topContent && stats.topContent.length > 0 && (
        <div className="analytics-top-content">
          <h5 className="analytics-top-content__title">Top Content</h5>
          <ul className="analytics-top-content__list">
            {stats.topContent.slice(0, 5).map((item, i) => (
              <li key={item.id || i} className="analytics-top-content__item">
                <span className="analytics-top-content__rank">#{i + 1}</span>
                <span className="analytics-top-content__title">
                  {item.title || item.content?.slice(0, 50) || 'Untitled'}
                </span>
                <span className="analytics-top-content__engagement">
                  {item.engagementRate || 0}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
