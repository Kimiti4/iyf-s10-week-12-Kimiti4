/**
 * 📊 Activity History Page
 * Track all user interactions: Views, Likes, Reshares, Comments
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './ActivityHistory.css';

const ActivityHistory = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock activity data - Replace with actual API calls
  useEffect(() => {
    setTimeout(() => {
      setActivities([
        {
          id: 1,
          type: 'view',
          action: 'Viewed post',
          target: 'Community Event Announcement',
          author: 'Jane Doe',
          timestamp: Date.now() - 3600000,
          icon: '👁️'
        },
        {
          id: 2,
          type: 'like',
          action: 'Liked post',
          target: 'New Marketplace Features',
          author: 'Tech Hub',
          timestamp: Date.now() - 7200000,
          icon: '❤️'
        },
        {
          id: 3,
          type: 'reshare',
          action: 'Reshared post',
          target: 'Amazing sunset in Nairobi',
          author: 'John Kamau',
          timestamp: Date.now() - 10800000,
          icon: '🔄'
        },
        {
          id: 4,
          type: 'comment',
          action: 'Commented on',
          target: 'Weekly Community Update',
          author: 'Community Leader',
          timestamp: Date.now() - 14400000,
          icon: '💬',
          comment: 'Great initiative! Keep it up!'
        },
        {
          id: 5,
          type: 'view',
          action: 'Viewed profile',
          target: 'Sarah Johnson',
          author: null,
          timestamp: Date.now() - 18000000,
          icon: '👤'
        },
        {
          id: 6,
          type: 'like',
          action: 'Liked comment',
          target: 'Discussion on local events',
          author: 'Mike Chen',
          timestamp: Date.now() - 21600000,
          icon: '❤️'
        },
        {
          id: 7,
          type: 'reshare',
          action: 'Reshared story',
          target: 'Behind the scenes at work',
          author: 'Creative Studio',
          timestamp: Date.now() - 25200000,
          icon: '🔄'
        },
        {
          id: 8,
          type: 'view',
          action: 'Viewed marketplace item',
          target: 'Handmade Jewelry Collection',
          author: 'Artisan Crafts',
          timestamp: Date.now() - 28800000,
          icon: '🛒'
        },
        {
          id: 9,
          type: 'comment',
          action: 'Replied to',
          target: 'Question about community guidelines',
          author: 'Admin Team',
          timestamp: Date.now() - 32400000,
          icon: '💬',
          comment: 'Thanks for clarifying!'
        },
        {
          id: 10,
          type: 'like',
          action: 'Liked post',
          target: 'Volunteer opportunity available',
          author: 'NGO Network',
          timestamp: Date.now() - 36000000,
          icon: '❤️'
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filters = [
    { id: 'all', label: 'All Activity', icon: '📋' },
    { id: 'view', label: 'Views', icon: '👁️' },
    { id: 'like', label: 'Likes', icon: '❤️' },
    { id: 'reshare', label: 'Reshares', icon: '🔄' },
    { id: 'comment', label: 'Comments', icon: '💬' }
  ];

  const filteredActivities = activeFilter === 'all' 
    ? activities 
    : activities.filter(a => a.type === activeFilter);

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getActivityStats = () => {
    const stats = {
      views: activities.filter(a => a.type === 'view').length,
      likes: activities.filter(a => a.type === 'like').length,
      reshares: activities.filter(a => a.type === 'reshare').length,
      comments: activities.filter(a => a.type === 'comment').length
    };
    return stats;
  };

  const stats = getActivityStats();

  if (loading) {
    return (
      <div className="activity-loading">
        <div className="loading-spinner"></div>
        <p>Loading activity history...</p>
      </div>
    );
  }

  return (
    <div className="activity-history-page">
      {/* Header */}
      <div className="activity-header">
        <h1>📊 Activity History</h1>
        <p>Track your recent interactions across JamiiLink</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card views">
          <span className="stat-icon">👁️</span>
          <div className="stat-info">
            <span className="stat-value">{stats.views}</span>
            <span className="stat-label">Views</span>
          </div>
        </div>
        <div className="stat-card likes">
          <span className="stat-icon">❤️</span>
          <div className="stat-info">
            <span className="stat-value">{stats.likes}</span>
            <span className="stat-label">Likes</span>
          </div>
        </div>
        <div className="stat-card reshares">
          <span className="stat-icon">🔄</span>
          <div className="stat-info">
            <span className="stat-value">{stats.reshares}</span>
            <span className="stat-label">Reshares</span>
          </div>
        </div>
        <div className="stat-card comments">
          <span className="stat-icon">💬</span>
          <div className="stat-info">
            <span className="stat-value">{stats.comments}</span>
            <span className="stat-label">Comments</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="activity-filters">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            <span className="filter-icon">{filter.icon}</span>
            <span className="filter-label">{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="activity-list">
        <AnimatePresence mode="wait">
          {filteredActivities.length === 0 ? (
            <motion.div
              key="empty"
              className="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="empty-icon">📭</span>
              <h3>No activity found</h3>
              <p>Your recent {filters.find(f => f.id === activeFilter)?.label.toLowerCase()} will appear here</p>
            </motion.div>
          ) : (
            filteredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                className={`activity-item ${activity.type}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="activity-icon">{activity.icon}</div>
                
                <div className="activity-content">
                  <div className="activity-main">
                    <span className="activity-action">{activity.action}</span>
                    <span className="activity-target">"{activity.target}"</span>
                    {activity.author && (
                      <span className="activity-author">by {activity.author}</span>
                    )}
                  </div>
                  
                  {activity.comment && (
                    <div className="activity-comment">
                      <span className="comment-quote">"</span>
                      {activity.comment}
                      <span className="comment-quote">"</span>
                    </div>
                  )}
                  
                  <div className="activity-meta">
                    <span className="activity-time">{formatTime(activity.timestamp)}</span>
                    <button className="btn-undo" title="Undo this action">
                      ↩️ Undo
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {filteredActivities.length > 0 && (
        <div className="load-more-section">
          <button className="btn-load-more">Load More Activity</button>
        </div>
      )}
    </div>
  );
};

export default ActivityHistory;
