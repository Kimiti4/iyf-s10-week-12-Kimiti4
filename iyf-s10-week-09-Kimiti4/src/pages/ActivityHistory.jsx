/**
 * 📊 Activity History - Your Journey Through JamiiLink!
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../styles/designSystem'
import { formatRelativeTime } from '../utils/formatTime'
import './ActivityHistory.css'

const ActivityHistory = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setActivities([
        {
          id: 1,
          type: 'view',
          action: 'Viewed post',
          target: 'Community Event Announcement',
          author: 'Jane Doe',
          timestamp: Date.now() - 3600000
        },
        {
          id: 2,
          type: 'like',
          action: 'Liked post',
          target: 'New Marketplace Features',
          author: 'Tech Hub',
          timestamp: Date.now() - 7200000
        },
        {
          id: 3,
          type: 'comment',
          action: 'Commented on',
          target: 'Weekly Community Update',
          author: 'Community Leader',
          timestamp: Date.now() - 14400000,
          comment: 'This is amazing! 🎉'
        }
      ])
      setLoading(false)
    }, 500)
  }, [])

  const filters = [
    { id: 'all', label: 'All My Adventures', icon: '🚀' },
    { id: 'view', label: 'Views', icon: '👁️' },
    { id: 'like', label: 'Likes', icon: '❤️' },
    { id: 'reshare', label: 'Reshares', icon: '🔄' },
    { id: 'comment', label: 'Comments', icon: '💬' }
  ]

  const filteredActivities = activeFilter === 'all' 
    ? activities 
    : activities.filter(a => a.type === activeFilter)

  if (loading) {
    return (
      <div className="activity-loading">
        <div className="loading-spinner"></div>
        <p>Loading your adventure log... 🗺️</p>
      </div>
    )
  }

  return (
    <div className="activity-history-page">
      <motion.div 
        className="activity-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>📊 Adventure Log</h1>
        <p>Your journey through JamiiLink! 🌟</p>
      </motion.div>

      <div className="stats-overview">
        <ActivityStat icon="👁️" value="12" label="Views" color={colors.info} />
        <ActivityStat icon="❤️" value="8" label="Likes" color={colors.danger} />
        <ActivityStat icon="🔄" value="3" label="Shares" color={colors.accent[500]} />
        <ActivityStat icon="💬" value="5" label="Comments" color={colors.success} />
      </div>

      <div className="activity-filters">
        {filters.map(filter => (
          <motion.button
            key={filter.id}
            className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
            whileHover={{ scale: 1.05 }}
          >
            <span className="filter-icon">{filter.icon}</span>
            <span>{filter.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="activity-list">
        <AnimatePresence>
          {filteredActivities.length === 0 ? (
            <motion.div 
              className="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="empty-illustration">📭</div>
              <h3>No adventures here yet! 🏖️</h3>
              <p>Start exploring the community to fill your log!</p>
            </motion.div>
          ) : (
            filteredActivities.map((activity) => (
              <motion.div
                key={activity.id}
                className="activity-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 5 }}
              >
                <span className="activity-icon">
                  {activity.type === 'view' && '👁️'}
                  {activity.type === 'like' && '❤️'}
                  {activity.type === 'reshare' && '🔄'}
                  {activity.type === 'comment' && '💬'}
                </span>
                <div>
                  <p>
                    <strong>{activity.action}</strong> "{activity.target}"
                    {activity.author && ` by ${activity.author}`}
                  </p>
                  {activity.comment && (
                    <p className="activity-comment">💭 "{activity.comment}"</p>
                  )}
                  <span className="activity-time">{formatRelativeTime(activity.timestamp)}</span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const ActivityStat = ({ icon, value, label, color }) => (
  <motion.div 
    className="activity-stat"
    whileHover={{ scale: 1.05 }}
    style={{ backgroundColor: `${color}20` }}
  >
    <span className="stat-icon" style={{ color }}>{icon}</span>
    <strong>{value}</strong>
    <span>{label}</span>
  </motion.div>
)

export default ActivityHistory