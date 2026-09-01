/**
 * J-019: Analytics Card Component
 *
 * Displays a single metric with label, value, trend, and optional icon.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatMetricValue } from '../../domain/analytics/analyticsTypes';
import '../../styles/Analytics.css';

export default function AnalyticsCard({
  label,
  value,
  previousValue,
  icon,
  type = 'count',
  trend = null,
  className = '',
  compact = false,
}) {
  const formattedValue = useMemo(() => formatMetricValue(value, type), [value, type]);

  const trendInfo = useMemo(() => {
    if (trend !== null) return { direction: trend >= 0 ? 'up' : 'down', value: Math.abs(trend) };
    if (previousValue == null || previousValue === 0) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return { direction: change >= 0 ? 'up' : 'down', value: Math.abs(Math.round(change)) };
  }, [value, previousValue, trend]);

  return (
    <motion.div
      className={`analytics-card ${compact ? 'analytics-card--compact' : ''} ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="analytics-card__header">
        {icon && <span className="analytics-card__icon">{icon}</span>}
        <span className="analytics-card__label">{label}</span>
      </div>
      <div className="analytics-card__value">{formattedValue}</div>
      {trendInfo && (
        <div className={`analytics-card__trend analytics-card__trend--${trendInfo.direction}`}>
          {trendInfo.direction === 'up' ? '↑' : '↓'} {trendInfo.value}%
        </div>
      )}
    </motion.div>
  );
}
