/**
 *  Trending Hashtags Widget
 * Shows popular hashtags with real-time trending indicators
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './TrendingHashtags.css';

export default function TrendingHashtags({ limit = 10 }) {
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingHashtags();
    // Refresh every 5 minutes
    const interval = setInterval(fetchTrendingHashtags, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrendingHashtags = async () => {
    try {
      // TODO: Replace with actual API call
      // For now, using mock data
      const mockHashtags = [
        { tag: 'NairobiTraffic', count: 2847, trend: 'up', change: '+42%' },
        { tag: 'KenyaAgriculture', count: 1923, trend: 'up', change: '+28%' },
        { tag: 'SkillSwap', count: 1456, trend: 'up', change: '+15%' },
        { tag: 'MtaaniAlerts', count: 1234, trend: 'down', change: '-5%' },
        { tag: 'GigEconomy', count: 987, trend: 'up', change: '+12%' },
        { tag: 'FarmersMarket', count: 876, trend: 'up', change: '+23%' },
        { tag: 'CommunityHelp', count: 765, trend: 'stable', change: '0%' },
        { tag: 'KCBusiness', count: 654, trend: 'up', change: '+8%' },
        { tag: 'NairobiLife', count: 543, trend: 'down', change: '-3%' },
        { tag: 'KenyaTech', count: 432, trend: 'up', change: '+19%' },
      ];

      setHashtags(mockHashtags.slice(0, limit));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return '#22c55e';
      case 'down': return '#ef4444';
      case 'stable': return '#64748b';
      default: return '#64748b';
    }
  };

  return (
    <div className="trending-hashtags-widget">
      <div className="trending-header">
        <h3 className="trending-title">
          <span className="trending-icon"></span>
          Trending Now
        </h3>
        <motion.div
          className="live-indicator"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="live-dot"></span>
          LIVE
        </motion.div>
      </div>

      {loading ? (
        <div className="trending-loading">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            🔄
          </motion.div>
          <p>Loading trending topics...</p>
        </div>
      ) : (
        <div className="trending-list">
          {hashtags.map((hashtag, index) => (
            <motion.div
              key={hashtag.tag}
              className="trending-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
            >
              <span className="trending-rank">#{index + 1}</span>

              <div className="trending-content">
                <h4 className="trending-tag">#{hashtag.tag}</h4>
                <p className="trending-posts">{hashtag.count.toLocaleString()} posts</p>
              </div>

              <motion.div
                className="trending-change"
                style={{ color: getTrendColor(hashtag.trend) }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <span className="trend-icon">{getTrendIcon(hashtag.trend)}</span>
                <span className="trend-value">{hashtag.change}</span>
              </motion.div>
            </motion.div>
          ))}
        </div>
      )}

      <motion.button
        className="view-all-btn"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        View All Trending Topics →
      </motion.button>
    </div>
  );
}
