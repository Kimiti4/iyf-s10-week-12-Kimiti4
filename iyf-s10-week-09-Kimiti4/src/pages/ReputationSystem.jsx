/**
 * 🏆 Reputation System
 * Features: Contribution Scoring, Badges, Leaderboards, Progress Tracking
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './ReputationSystem.css';

const ReputationSystem = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Mock reputation data - Replace with actual API calls
  const [reputationData, setReputationData] = useState({
    score: 2847.50,
    level: 12,
    rank: '#3',
    nextLevel: {
      level: 13,
      requiredScore: 3000,
      progress: 94.9
    },
    badges: [
      { id: 1, name: 'First Post', icon: '📝', earned: Date.now() - 86400000 * 365, description: 'Created your first post' },
      { id: 2, name: 'Helper', icon: '🤝', earned: Date.now() - 86400000 * 180, description: 'Helped 10 community members' },
      { id: 3, name: 'Content Creator', icon: '🎨', earned: Date.now() - 86400000 * 90, description: 'Published 20 posts' },
      { id: 4, name: 'Community Builder', icon: '🏗️', earned: Date.now() - 86400000 * 30, description: 'Organized 5 events' },
      { id: 5, name: 'Mentor', icon: '👨‍🏫', earned: Date.now() - 86400000 * 15, description: 'Mentored 5 newcomers' },
      { id: 6, name: 'Top Contributor', icon: '⭐', earned: null, description: 'Reach top 1% of contributors', locked: true },
    ],
    activity: [
      { type: 'post', count: 45, points: 45, label: 'Posts Created' },
      { type: 'reply', count: 128, points: 256, label: 'Helpful Replies' },
      { type: 'event', count: 8, points: 40, label: 'Events Hosted' },
      { type: 'mentorship', count: 15, points: 45, label: 'Mentorship Hours' },
      { type: 'upvote_received', count: 342, points: 34.2, label: 'Upvotes Received' },
    ],
    leaderboard: [
      { rank: 1, name: 'Jane Doe', score: 4523.80, badge: '🥇', change: 0 },
      { rank: 2, name: 'John Smith', score: 3891.20, badge: '🥈', change: 0 },
      { rank: 3, name: user?.name || 'You', score: 2847.50, badge: '🥉', change: 1, isUser: true },
      { rank: 4, name: 'Sarah Johnson', score: 2654.30, badge: '', change: -1 },
      { rank: 5, name: 'Mike Chen', score: 2401.90, badge: '', change: 2 },
      { rank: 6, name: 'Lisa Park', score: 2198.40, badge: '', change: 0 },
      { rank: 7, name: 'David Kim', score: 1987.60, badge: '', change: -2 },
      { rank: 8, name: 'Emma Wilson', score: 1876.20, badge: '', change: 1 },
      { rank: 9, name: 'Chris Lee', score: 1654.80, badge: '', change: 0 },
      { rank: 10, name: 'Anna Brown', score: 1543.50, badge: '', change: 3 },
    ],
    recentActivity: [
      { id: 1, action: 'Posted helpful reply', points: 2, timestamp: Date.now() - 3600000 },
      { id: 2, action: 'Received upvote', points: 0.1, timestamp: Date.now() - 7200000 },
      { id: 3, action: 'Hosted community event', points: 5, timestamp: Date.now() - 86400000 },
      { id: 4, action: 'Mentored new member', points: 3, timestamp: Date.now() - 172800000 },
      { id: 5, action: 'Created original post', points: 1, timestamp: Date.now() - 259200000 },
    ]
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not yet earned';
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  const getLevelTitle = (level) => {
    const titles = {
      1: 'Newcomer',
      5: 'Contributor',
      10: 'Active Member',
      15: 'Community Leader',
      20: 'Expert',
      25: 'Master',
      30: 'Legend'
    };
    
    for (let threshold of Object.keys(titles).sort((a, b) => b - a)) {
      if (level >= parseInt(threshold)) return titles[threshold];
    }
    return 'Newcomer';
  };

  if (loading) {
    return (
      <div className="reputation-loading">
        <div className="loading-spinner"></div>
        <p>Calculating your reputation...</p>
      </div>
    );
  }

  return (
    <div className="reputation-system">
      {/* Header with Level & Score */}
      <div className="reputation-header">
        <div className="header-left">
          <div className="level-badge">
            <span className="level-number">{reputationData.level}</span>
            <span className="level-title">{getLevelTitle(reputationData.level)}</span>
          </div>
          <div className="score-display">
            <span className="score-value">{reputationData.score.toFixed(2)}</span>
            <span className="score-label">Reputation Points</span>
          </div>
        </div>
        <div className="header-right">
          <div className="rank-display">
            <span className="rank-badge">{reputationData.rank}</span>
            <span className="rank-label">Global Rank</span>
          </div>
        </div>
      </div>

      {/* Progress to Next Level */}
      <div className="progress-section">
        <div className="progress-info">
          <span>Progress to Level {reputationData.nextLevel.level}</span>
          <span>{reputationData.nextLevel.progress}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${reputationData.nextLevel.progress}%` }}
          ></div>
        </div>
        <div className="progress-detail">
          <span>{reputationData.score.toFixed(0)} / {reputationData.nextLevel.requiredScore} points</span>
          <span>{(reputationData.nextLevel.requiredScore - reputationData.score).toFixed(0)} points needed</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="reputation-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
           Badges
        </button>
        <button 
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Leaderboard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
           Activity
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              className="overview-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Activity Breakdown */}
              <div className="overview-card full-width">
                <h3>📈 Activity Breakdown</h3>
                <div className="activity-breakdown">
                  {reputationData.activity.map((item, index) => (
                    <div key={index} className="breakdown-item">
                      <div className="breakdown-icon">
                        {item.type === 'post' && '📝'}
                        {item.type === 'reply' && '💬'}
                        {item.type === 'event' && '🎪'}
                        {item.type === 'mentorship' && '👨‍🏫'}
                        {item.type === 'upvote_received' && '⬆️'}
                      </div>
                      <div className="breakdown-info">
                        <span className="breakdown-label">{item.label}</span>
                        <span className="breakdown-count">{item.count}</span>
                      </div>
                      <div className="breakdown-points">
                        +{item.points.toFixed(1)} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="overview-card">
                <h3>🕒 Recent Activity</h3>
                <div className="recent-activity">
                  {reputationData.recentActivity.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        {activity.points > 0 ? '+' : ''}{activity.points.toFixed(1)}
                      </div>
                      <div className="activity-details">
                        <span className="activity-action">{activity.action}</span>
                        <span className="activity-time">{formatDate(activity.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="overview-card">
                <h3>🎯 Quick Stats</h3>
                <div className="quick-stats">
                  <div className="stat-item">
                    <span className="stat-icon">📝</span>
                    <div className="stat-info">
                      <span className="stat-value">{reputationData.activity.find(a => a.type === 'post')?.count || 0}</span>
                      <span className="stat-label">Total Posts</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">💬</span>
                    <div className="stat-info">
                      <span className="stat-value">{reputationData.activity.find(a => a.type === 'reply')?.count || 0}</span>
                      <span className="stat-label">Replies</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">🎪</span>
                    <div className="stat-info">
                      <span className="stat-value">{reputationData.activity.find(a => a.type === 'event')?.count || 0}</span>
                      <span className="stat-label">Events</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">⭐</span>
                    <div className="stat-info">
                      <span className="stat-value">{reputationData.badges.filter(b => !b.locked).length}</span>
                      <span className="stat-label">Badges Earned</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'badges' && (
            <motion.div 
              key="badges"
              className="badges-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {reputationData.badges.map((badge) => (
                <div 
                  key={badge.id} 
                  className={`badge-card ${badge.locked ? 'locked' : ''}`}
                >
                  <div className="badge-icon">{badge.icon}</div>
                  <div className="badge-info">
                    <h3>{badge.name}</h3>
                    <p>{badge.description}</p>
                    <span className="badge-date">
                      {badge.locked ? '🔒 Locked' : `Earned ${formatDate(badge.earned)}`}
                    </span>
                  </div>
                  {!badge.locked && (
                    <div className="badge-checkmark">✓</div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div 
              key="leaderboard"
              className="leaderboard-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Member</th>
                    <th>Score</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {reputationData.leaderboard.map((member) => (
                    <tr key={member.rank} className={member.isUser ? 'user-row' : ''}>
                      <td className="rank-cell">
                        <span className="rank-number">{member.rank}</span>
                        {member.badge && <span className="rank-medal">{member.badge}</span>}
                      </td>
                      <td className="name-cell">
                        {member.name}
                        {member.isUser && <span className="you-badge">You</span>}
                      </td>
                      <td className="score-cell">{member.score.toFixed(2)}</td>
                      <td className="change-cell">
                        {member.change > 0 && <span className="change-up">↑ {member.change}</span>}
                        {member.change < 0 && <span className="change-down">↓ {Math.abs(member.change)}</span>}
                        {member.change === 0 && <span className="change-neutral">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div 
              key="activity"
              className="activity-timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="timeline-intro">
                <h3>📅 Your Contribution Timeline</h3>
                <p>Detailed history of all reputation-earning activities</p>
              </div>
              
              <div className="timeline-list">
                {reputationData.recentActivity.map((activity, index) => (
                  <div key={activity.id} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-action">{activity.action}</span>
                        <span className="timeline-points">+{activity.points.toFixed(1)} pts</span>
                      </div>
                      <span className="timeline-time">{formatDate(activity.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReputationSystem;
