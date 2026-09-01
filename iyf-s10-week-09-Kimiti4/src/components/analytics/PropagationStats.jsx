/**
 * J-019: Propagation Stats Component
 *
 * Shows how content is spreading across the platform.
 * Displays views, engagement rate, virality score, and propagation depth.
 */

import { FaEye, FaHeart, FaComment, FaShare, FaRetweet, FaFire, FaBookmark } from 'react-icons/fa';
import AnalyticsCard from './AnalyticsCard';
import MiniChart from './MiniChart';
import usePropagation from '../../hooks/usePropagation';
import { classifyPerformanceTier } from '../../domain/analytics/analyticsTypes';
import '../../styles/Analytics.css';

export default function PropagationStats({ contentId, compact = false }) {
  const { propagation, timeSeries, loading, error } = usePropagation(contentId);

  if (loading) {
    return (
      <div className="analytics-section analytics-section--loading">
        <div className="analytics-skeleton" />
      </div>
    );
  }

  if (error || !propagation) {
    return null;
  }

  const tier = classifyPerformanceTier(propagation.engagementRate);

  return (
    <div className="analytics-section">
      <div className="analytics-section__header">
        <h4 className="analytics-section__title">Propagation</h4>
        <span className="analytics-tier" style={{ color: tier.color }}>
          {tier.label}
        </span>
      </div>

      <div className={`analytics-grid ${compact ? 'analytics-grid--compact' : ''}`}>
        <AnalyticsCard
          label="Views"
          value={propagation.views}
          icon={<FaEye />}
          compact={compact}
        />
        <AnalyticsCard
          label="Likes"
          value={propagation.likes}
          icon={<FaHeart />}
          compact={compact}
        />
        <AnalyticsCard
          label="Comments"
          value={propagation.comments}
          icon={<FaComment />}
          compact={compact}
        />
        <AnalyticsCard
          label="Shares"
          value={propagation.shares}
          icon={<FaShare />}
          compact={compact}
        />
        <AnalyticsCard
          label="Reposts"
          value={propagation.reposts}
          icon={<FaRetweet />}
          compact={compact}
        />
        <AnalyticsCard
          label="Remixes"
          value={propagation.remixes}
          icon={<FaBookmark />}
          compact={compact}
        />
        <AnalyticsCard
          label="Engagement"
          value={propagation.engagementRate}
          type="rate"
          icon={<FaFire />}
          compact={compact}
        />
      </div>

      {!compact && timeSeries.length > 0 && (
        <div className="analytics-chart">
          <MiniChart data={timeSeries} height={80} />
        </div>
      )}
    </div>
  );
}
