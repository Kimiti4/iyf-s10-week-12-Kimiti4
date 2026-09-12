/**
 * 📊 Activity History - backed by the real /api/activity/me endpoint,
 * which aggregates the authenticated user's own persisted actions.
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../styles/designSystem'
import { formatRelativeTime } from '../utils/formatTime'
import { request } from '../services/apiClient'
import './ActivityHistory.css'

const TYPE_ICONS = {
  post: '📝',
  comment: '💬',
  follow: '🤝',
  jam: '🔥',
  contribution: '🎨'
}

const ActivityHistory = () => {
  const [activeFilter, setActiveFilter] = useState('all')
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({ posts: 0, comments: 0, follows: 0, contributions: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadActivity = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await request('/activity/me?limit=50')
      setActivities(res.data || [])
      setStats(res.stats || { posts: 0, comments: 0, follows: 0, contributions: 0 })
    } catch (err) {
      setError(err.message || 'Failed to load activity')
      setActivities([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadActivity()
  }, [loadActivity])

  const filters = [
    { id: 'all', label: 'All My Adventures', icon: '🚀' },
    { id: 'post', label: 'Posts', icon: '📝' },
    { id: 'comment', label: 'Comments', icon: '💬' },
    { id: 'follow', label: 'Follows', icon: '🤝' },
    { id: 'jam', label: 'Jams', icon: '🔥' },
    { id: 'contribution', label: 'Contributions', icon: '🎨' }
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
    <main className="activity-history-page" role="main" aria-label="Activity history">
      <motion.div
        className="activity-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>📊 Adventure Log</h1>
        <p>Your journey through JamiiLink! 🌟</p>
      </motion.div>

      <div className="stats-overview">
        <ActivityStat icon="📝" value={stats.posts} label="Posts" color={colors.info} />
        <ActivityStat icon="💬" value={stats.comments} label="Comments" color={colors.success} />
        <ActivityStat icon="🤝" value={stats.follows} label="Follows" color={colors.accent[500]} />
        <ActivityStat icon="🎨" value={stats.contributions} label="Contributions" color={colors.danger} />
      </div>

      {error && (
        <div className="activity-error" role="alert">
          {error}
          <button onClick={loadActivity}>Try again</button>
        </div>
      )}

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
                  {TYPE_ICONS[activity.type] || '📌'}
                </span>
                <div>
                  <p>
                    <strong>{activity.action}</strong> "{activity.target}"
                    {activity.author && ` by ${activity.author}`}
                  </p>
                  <span className="activity-time">{formatRelativeTime(activity.timestamp)}</span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </main>
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
