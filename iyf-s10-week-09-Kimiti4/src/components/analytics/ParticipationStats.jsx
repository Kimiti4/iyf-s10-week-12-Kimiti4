/**
 * J-019: Participation Stats Component
 *
 * Shows how people are engaging with a Jam.
 * Displays member counts, contributions, retention, and top contributors.
 */

import { FaUsers, FaHandshake, FaChartLine, FaTrophy } from 'react-icons/fa';
import AnalyticsCard from './AnalyticsCard';
import useJamAnalytics from '../../hooks/useJamAnalytics';
import '../../styles/Analytics.css';

export default function ParticipationStats({ jamId, compact = false }) {
  const { participation, leaderboard, loading, error } = useJamAnalytics(jamId);

  if (loading) {
    return (
      <div className="analytics-section analytics-section--loading">
        <div className="analytics-skeleton" />
      </div>
    );
  }

  if (error || !participation) {
    return null;
  }

  return (
    <div className="analytics-section">
      <div className="analytics-section__header">
        <h4 className="analytics-section__title">Participation</h4>
      </div>

      <div className={`analytics-grid ${compact ? 'analytics-grid--compact' : ''}`}>
        <AnalyticsCard
          label="Members"
          value={participation.totalMembers}
          icon={<FaUsers />}
          compact={compact}
        />
        <AnalyticsCard
          label="Active"
          value={participation.activeMembers}
          icon={<FaHandshake />}
          compact={compact}
        />
        <AnalyticsCard
          label="Contributions"
          value={participation.contributions}
          icon={<FaChartLine />}
          compact={compact}
        />
        <AnalyticsCard
          label="Retention"
          value={participation.retentionRate}
          type="rate"
          icon={<FaTrophy />}
          compact={compact}
        />
      </div>

      {!compact && leaderboard.length > 0 && (
        <div className="analytics-leaderboard">
          <h5 className="analytics-leaderboard__title">Top Contributors</h5>
          <ul className="analytics-leaderboard__list">
            {leaderboard.slice(0, 5).map((entry, i) => (
              <li key={entry.userId || i} className="analytics-leaderboard__item">
                <span className="analytics-leaderboard__rank">#{i + 1}</span>
                <span className="analytics-leaderboard__name">
                  {entry.displayName || entry.username || 'Anonymous'}
                </span>
                <span className="analytics-leaderboard__score">
                  {entry.contributions || entry.score || 0}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
