/**
 * 👑 Founder's Command Center - Rule Your Empire!
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { colors } from '../styles/designSystem'
import './FounderDashboard.css'

export default function FounderDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setLoading(false), 800)
  }, [])

  if (!user || (user.role !== 'founder' && !user.isFounder)) {
    return (
      <div className="access-denied">
        <div className="denied-content">
          <span className="denied-icon">🚫</span>
          <h1>Access Denied</h1>
          <p>This royal chamber is only for the platform founder! 👑</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'content', icon: '📝', label: 'Content' },
    { id: 'alerts', icon: '🚨', label: 'Alerts' },
    { id: 'ai', icon: '🤖', label: 'Tiannara AI' }
  ]

  return (
    <div className="founder-dashboard">
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-left">
          <span className="crown-icon">👑</span>
          <div>
            <h1>Welcome, Founder! 🎉</h1>
            <p>Your Kingdom's Control Panel</p>
          </div>
        </div>
        <div className="header-right">
          <span className="founder-badge">💎 Diamond Tier</span>
        </div>
      </motion.div>

      <motion.div 
        className="dashboard-tabs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.05 }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            className="overview-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="stats-grid">
              <StatCard title="Total Citizens" value="1,247" icon="👥" color={colors.primary[500]} trend="+12%" />
              <StatCard title="Active Posts" value="845" icon="📝" color={colors.success} trend="+8%" />
              <StatCard title="Happy Groups" value="23" icon="🏢" color="#667eea" trend="+5%" />
              <StatCard title="Events Thrown" value="34" icon="🎉" color={colors.accent[500]} trend="+15%" />
            </div>

            <div className="ai-status-section">
              <h2>🤖 AI Assistant Status</h2>
              <div className="ai-grid">
                <AILinkCard title="Tiannara AI" status="active" requests="24/7" accuracy="95%" />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div 
            key="users"
            className="users-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2>👥 Manage Citizens</h2>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Power</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Jane Doe <span className="online-dot">🟢</span></td>
                    <td>Admin</td>
                    <td>💎 Diamond</td>
                  </tr>
                  <tr>
                    <td>John Smith <span className="offline-dot">⚪</span></td>
                    <td>User</td>
                    <td>🥉 Bronze</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'alerts' && (
          <motion.div 
            key="alerts"
            className="alerts-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2>🚨 Emergency Alerts</h2>
            <p className="warning-text">Use with royal responsibility! ⚠️</p>
            
            <div className="alert-form">
              <input type="text" placeholder="Alert title..." />
              <textarea placeholder="Important message to citizens..." rows="4" />
              <select>
                <option>Security 🛡️</option>
                <option>Weather ⛈️</option>
                <option>Health 🏥</option>
              </select>
              <motion.button 
                className="btn-danger"
                whileHover={{ scale: 1.02 }}
              >
                🚨 Broadcast Alert
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const StatCard = ({ title, value, icon, color, trend }) => (
  <motion.div 
    className="stat-card"
    whileHover={{ y: -5, boxShadow: `0 10px 30px ${color}33` }}
  >
    <span className="stat-icon">{icon}</span>
    <div>
      <h3>{title}</h3>
      <strong className="stat-value">{value}</strong>
      {trend && <span className="trend">📈 {trend}</span>}
    </div>
  </motion.div>
)

const AILinkCard = ({ title, status, requests, accuracy }) => (
  <motion.div 
    className="ai-card"
    whileHover={{ scale: 1.02 }}
  >
    <h3>{title}</h3>
    <p>Status: <span className="status-active">✅ Active</span></p>
    <p>Requests: {requests}</p>
    <p>Accuracy: {accuracy}</p>
  </motion.div>
)