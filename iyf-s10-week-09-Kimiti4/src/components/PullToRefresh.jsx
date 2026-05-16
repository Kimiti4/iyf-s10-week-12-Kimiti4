/**
 * 🔄 Pull to Refresh Indicator
 * Visual feedback for pull-to-refresh action
 */

import { motion } from 'framer-motion';
import './PullToRefresh.css';

export default function PullToRefreshIndicator({ isRefreshing, progress }) {
  if (!isRefreshing && progress === 0) return null;

  return (
    <motion.div
      className="ptr-indicator"
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: isRefreshing || progress > 0.3 ? 1 : 0,
        y: isRefreshing ? 0 : -20 + (progress * 20)
      }}
      transition={{ duration: 0.2 }}
    >
      {isRefreshing ? (
        <>
          <div className="ptr-spinner"></div>
          <span className="ptr-text">Refreshing...</span>
        </>
      ) : (
        <>
          <span className="ptr-icon" style={{ transform: `rotate(${progress * 180}deg)` }}>
            ⬇️
          </span>
          <span className="ptr-text">
            {progress > 0.8 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </>
      )}
    </motion.div>
  );
}
