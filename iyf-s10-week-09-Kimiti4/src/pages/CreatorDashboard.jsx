/**
 * 🎨 Creator Studio - Your Creative Empire!
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../styles/designSystem'
import './CreatorDashboard.css'

export default function CreatorDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  const creatorData = {
    rights: [
      { id: 1, title: 'Digital Art Collection #1', type: 'image', sales: 45, revenue: 2250 },
      { id: 2, title: 'Python Data Science Course', type: 'digital', sales: 120, revenue: 3600 },
      { id: 3, title: 'E-Book: Community Building Guide', type: 'document', sales: 78, revenue: 1560 }
    ],
    stats: {
      totalWorks: 3,
      totalSales: 243,
      totalRevenue: 7410,
      netEarnings: 7150.65
    }
  }

  useEffect(() => {
    setTimeout(() => setLoading(false), 500)
  }, [])

  const formatCurrency = (amount) => `KES ${amount.toLocaleString()}`

  if (loading) {
    return (
      <div className="creator-loading">
        <div className="loading-spinner"></div>
        <p>Loading your creative space... 🎨</p>
      </div>
    )
  }

  return (
    <div className="creator-dashboard">
      <motion.div 
        className="creator-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>🎨 Creator Studio</h1>
        <p>Your creative empire on JamiiLink! ✨</p>
      </motion.div>

      <div className="creator-stats">
        <div className="stat-card">
          <span className="stat-icon">🎨</span>
          <div>
            <span className="stat-value">{creatorData.stats.totalWorks}</span>
            <span className="stat-label">Works</span>
          </div>
        </div>
        <div className="stat-card highlight">
          <span className="stat-icon">💰</span>
          <div>
            <span className="stat-value">{formatCurrency(creatorData.stats.netEarnings)}</span>
            <span className="stat-label">Earned</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div>
            <span className="stat-value">{creatorData.stats.totalSales}</span>
            <span className="stat-label">Sales</span>
          </div>
        </div>
      </div>

      <div className="creator-tabs">
        {['overview', 'rights', 'sales'].map(tab => (
          <motion.button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            whileHover={{ scale: 1.05 }}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'rights' && '📜 Rights'}
            {tab === 'sales' && '💰 Sales'}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            className="overview-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="fee-transparency">
              <h3>💸 Fee Transparency</h3>
              <p>You keep 93.6% of every sale!</p>
              <div className="fee-bar">
                <div className="fee-segment creator" style={{ width: '93.6%' }}></div>
                <div className="fee-segment platform" style={{ width: '6.4%' }}></div>
              </div>
            </div>
            
            <motion.button 
              className="btn-export-passport"
              whileHover={{ scale: 1.02 }}
            >
              📄 Export Creator Passport
            </motion.button>
          </motion.div>
        )}

        {activeTab === 'rights' && (
          <motion.div 
            key="rights"
            className="rights-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="rights-grid">
              {creatorData.rights.map((work) => (
                <motion.div 
                  key={work.id}
                  className="rights-card"
                  whileHover={{ y: -5 }}
                >
                  <div className="work-icon">
                    {work.type === 'image' && '🎨'}
                    {work.type === 'digital' && '💻'}
                    {work.type === 'document' && '📄'}
                  </div>
                  <h3>{work.title}</h3>
                  <div className="work-stats">
                    <span>👥 {work.sales} sales</span>
                    <span>💰 {formatCurrency(work.revenue)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'sales' && (
          <motion.div 
            key="sales"
            className="sales-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Work 📚</th>
                  <th>Buyer 👤</th>
                  <th>You Keep</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Digital Art #1</td>
                  <td>John K.</td>
                  <td>💰 KES 48.25</td>
                </tr>
                <tr>
                  <td>Python Course</td>
                  <td>Sarah M.</td>
                  <td>💰 KES 28.83</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}