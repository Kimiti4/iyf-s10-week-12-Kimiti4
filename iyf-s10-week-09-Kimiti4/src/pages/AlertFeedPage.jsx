/**
 * 🚨 Alert Feed - Stay in the Loop!
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '../components/Toast'
import { AlertIcon, VerifiedIcon, LoadingIcon } from '../components/SVGIcons'
import { colors } from '../styles/designSystem'
import './AlertFeedPage.css'

const CATEGORIES = [
  { value: 'all', label: 'All Alerts 🌟', color: colors.primary[500] },
  { value: 'emergency', label: 'Emergency 🚨', color: colors.danger },
  { value: 'security', label: 'Security 🛡️', color: '#667eea' },
  { value: 'scam_warning', label: 'Scam Warning ⚠️', color: colors.warning },
  { value: 'weather', label: 'Weather ☀️', color: '#06b6d4' },
  { value: 'event', label: 'Events 🎉', color: colors.accent[500] }
]

export default function AlertFeedPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const [filters, setFilters] = useState({ category: 'all' })
  
  const toast = useToast()

  useEffect(() => {
    const mockAlerts = [
      {
        _id: '1',
        title: 'Water Interruption in Kibera',
        content: 'Water will be interrupted tomorrow 8am-4pm for maintenance. Please store water in advance!',
        category: 'utility_outage',
        severity: 'warning',
        verificationLevel: 'official',
        location: 'Kibera Zone 2',
        confirmations: 25,
        createdAt: Date.now() - 3600000
      },
      {
        _id: '2',
        title: 'Safety Alert - Suspicious Activity',
        content: 'Be aware of suspicious individuals around the market area. Report anything unusual.',
        category: 'security',
        severity: 'critical',
        verificationLevel: 'mod_verified',
        location: 'Nairobi Market',
        confirmations: 42,
        createdAt: Date.now() - 7200000
      }
    ]
    
    setTimeout(() => {
      setAlerts(mockAlerts)
      setLoading(false)
    }, 800)
  }, [])
  
  const getCategoryIcon = (category) => {
    const icons = {
      emergency: '🚨',
      security: '🛡️',
      scam_warning: '⚠️',
      utility_outage: '💧',
      weather: '☀️',
      event: '🎉'
    }
    return icons[category] || '📢'
  }
  
  const getSeverityColor = (severity) => {
    const map = {
      critical: colors.danger,
      warning: colors.warning,
      official: colors.info,
      info: colors.primary[500]
    }
    return map[severity] || colors.primary[500]
  }

  return (
    <div className="alert-feed-page">
      <motion.div 
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content">
          <h1>🚨 Community Alerts</h1>
          <p>Stay informed with what's happening in your area</p>
        </div>
        <motion.button
          className="btn-create-alert"
          onClick={() => setShowCreateForm(!showCreateForm)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showCreateForm ? '✕ Cancel' : '+ Create Alert'}
        </motion.button>
      </motion.div>
      
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="create-form-wrapper"
          >
            <div className="alert-form">
              <h3>📢 Share Important News</h3>
              <input type="text" placeholder="Alert title..." />
              <textarea placeholder="What's happening? Be specific!" rows="3" />
              <select>
                <option>Select category...</option>
                {CATEGORIES.slice(1).map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <motion.button className="btn-primary" whileHover={{ scale: 1.02 }}>
                Publish Alert
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="filters-bar">
        {CATEGORIES.map(cat => (
          <motion.button
            key={cat.value}
            className={`filter-btn ${filters.category === cat.value ? 'active' : ''}`}
            onClick={() => setFilters({ ...filters, category: cat.value })}
            whileHover={{ scale: 1.05 }}
            style={{ 
              backgroundColor: filters.category === cat.value ? cat.color : 'transparent',
              borderColor: cat.color
            }}
          >
            {cat.label}
          </motion.button>
        ))}
      </div>
      
      <div className="alerts-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading alerts... 📡</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">📭</div>
            <h3>No alerts found</h3>
            <p>Everything seems quiet in your area!</p>
          </div>
        ) : (
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ x: 5 }}
                className="alert-card"
              >
                <div className="alert-header">
                  <span className="alert-icon">{getCategoryIcon(alert.category)}</span>
                  <span 
                    className="alert-severity"
                    style={{ backgroundColor: getSeverityColor(alert.severity) }}
                  >
                    {alert.severity}
                  </span>
                </div>
                
                <h3>{alert.title}</h3>
                <p className="alert-content">{alert.content}</p>
                
                <div className="alert-meta">
                  <span>📍 {alert.location}</span>
                  <span>👍 {alert.confirmations} confirmed</span>
                  <span>⏰ {new Date(alert.createdAt).toLocaleTimeString()}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}