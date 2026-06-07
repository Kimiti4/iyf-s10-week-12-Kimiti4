/**
 * 🏢 Organization Hub - Your Community Groups!
 */

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { colors } from '../styles/designSystem'
import './OrganizationPage.css'

export default function OrganizationPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mockOrg = {
      slug,
      name: 'Tech Hub Nairobi',
      description: 'A vibrant community of tech enthusiasts, developers, and innovators in Nairobi!',
      type: 'community',
      stats: {
        memberCount: 1250,
        postCount: 845,
        eventCount: 23
      },
      verified: true,
      verificationLevel: 'platinum',
      contact: {
        email: 'hello@techhub.co.ke'
      },
      members: ['You', 'Jane', 'John', 'Sarah']
    }
    
    setTimeout(() => {
      setOrganization(mockOrg)
      setLoading(false)
    }, 800)
  }, [slug])

  if (loading) {
    return (
      <motion.div 
        className="loading-state"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="loading-spinner"></div>
        <p>Loading community space... 🎪</p>
      </motion.div>
    )
  }

  if (!organization) {
    return (
      <motion.div 
        className="error-state"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2>Organization Not Found 🏚️</h2>
        <p>Looks like this community doesn't exist yet.</p>
        <Link to="/" className="btn-secondary">← Back to Feed</Link>
      </motion.div>
    )
  }

  const getOrgEmoji = (type) => {
    const map = {
      school: '🏫',
      university: '🎓',
      estate: '🏘️',
      church: '⛪',
      ngo: '🤝',
      sme: '💼',
      coworking: '🏢',
      community: '👥',
      youth_group: '🌟',
      professional: '💼'
    }
    return map[type] || '🏢'
  }

  return (
    <div className="organization-page">
      <motion.header 
        className="org-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="org-icon-large">
          {getOrgEmoji(organization.type)}
        </div>
        
        <div className="org-header-info">
          <h1>{organization.name} 🌟</h1>
          <p>{organization.description}</p>
          
          <div className="org-meta">
            <span className="org-type-badge">{organization.type}</span>
            <span className="org-members">👥 {organization.stats.memberCount} members</span>
            <span className="org-posts">📝 {organization.stats.postCount} posts</span>
          </div>
        </div>
        
        <motion.button 
          className="btn-join-org"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {organization.members.includes('You') ? '✓ Member' : 'Join Community 🚀'}
        </motion.button>
      </motion.header>

      <div className="org-nav">
        <button 
          className={`nav-tab active`}
        >
          📰 Feed
        </button>
        <button 
          className="nav-tab"
        >
          👥 Members ({organization.stats.memberCount})
        </button>
        <button 
          className="nav-tab"
        >
          🎪 Events ({organization.stats.eventCount})
        </button>
      </div>

      <main className="org-main">
        <section className="org-feed">
          <div className="feed-header">
            <h2>📰 Community Feed</h2>
            <motion.button 
              className="btn-create-post"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/create-post')}
            >
              ✨ Create Post
            </motion.button>
          </div>

          <div className="empty-feed">
            <div className="empty-illustration">📭</div>
            <h3>No posts yet!</h3>
            <p>Be the first to spark a conversation 🎉</p>
            <Link to="/create-post" className="btn-primary">
              Create First Post ✍️
            </Link>
          </div>
        </section>

        <aside className="org-sidebar">
          <div className="sidebar-card">
            <h3>🚀 Quick Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{organization.stats.memberCount}</span>
                <span className="stat-label">Members</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{organization.stats.postCount}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{organization.stats.eventCount}</span>
                <span className="stat-label">Events</span>
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <h3>📞 Contact</h3>
            <p>✉️ {organization.contact?.email}</p>
            <motion.button 
              className="btn-secondary"
              whileHover={{ scale: 1.02 }}
            >
              Message Admin 💬
            </motion.button>
          </div>
        </aside>
      </main>
    </div>
  )
}