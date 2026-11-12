/**
 * Activity History — backed by /api/activity/me
 */
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatRelativeTime } from '../utils/formatTime'
import { request } from '../services/apiClient'
import PageHeader from '../components/primitives/PageHeader'
import EmptyState from '../components/primitives/EmptyState'
import ErrorState from '../components/primitives/ErrorState'
import './ActivityHistory.css'

const TYPE_ICONS = {
  post: '📝',
  comment: '💬',
  follow: '🤝',
  jam: '🔥',
  contribution: '🎨',
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
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'post', label: 'Posts', icon: '📝' },
    { id: 'comment', label: 'Comments', icon: '💬' },
    { id: 'follow', label: 'Follows', icon: '🤝' },
    { id: 'jam', label: 'Jams', icon: '🔥' },
    { id: 'contribution', label: 'Contributions', icon: '🎨' },
  ]

  const filteredActivities = activeFilter === 'all'
    ? activities
    : activities.filter(a => a.type === activeFilter)

  if (loading) {
    return (
      <div className="activity-loading" role="status">
        <div className="loading-spinner" aria-hidden="true" />
        <p>Loading activity...</p>
      </div>
    )
  }

  return (
    <main className="activity-history-page" role="main" aria-label="Activity history">
      <PageHeader
        eyebrow="Your activity"
        title="Activity"
        subtitle="Posts, comments, follows, and contributions"
      />

      <div className="stats-overview">
        <ActivityStat icon="📝" value={stats.posts} label="Posts" />
        <ActivityStat icon="💬" value={stats.comments} label="Comments" />
        <ActivityStat icon="🤝" value={stats.follows} label="Follows" />
        <ActivityStat icon="🎨" value={stats.contributions} label="Contributions" />
      </div>

      {error && (
        <ErrorState error={error} onRetry={loadActivity} />
      )}

      <div className="activity-filters" role="toolbar" aria-label="Filter activity">
        {filters.map(filter => (
          <button
            key={filter.id}
            type="button"
            className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
            aria-pressed={activeFilter === filter.id}
          >
            <span className="filter-icon" aria-hidden="true">{filter.icon}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      <div className="activity-list">
        <AnimatePresence>
          {filteredActivities.length === 0 ? (
            <EmptyState
              icon="📭"
              title="No activity yet"
              message="Your posts, comments, and follows will show up here"
            />
          ) : (
            filteredActivities.map((activity) => (
              <motion.div
                key={activity.id}
                className="activity-item"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <span className="activity-icon" aria-hidden="true">
                  {TYPE_ICONS[activity.type] || '📌'}
                </span>
                <div>
                  <p>
                    <strong>{activity.action}</strong> &ldquo;{activity.target}&rdquo;
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

const ActivityStat = ({ icon, value, label }) => (
  <div className="activity-stat">
    <span className="stat-icon" aria-hidden="true">{icon}</span>
    <strong>{value}</strong>
    <span>{label}</span>
  </div>
)

export default ActivityHistory
