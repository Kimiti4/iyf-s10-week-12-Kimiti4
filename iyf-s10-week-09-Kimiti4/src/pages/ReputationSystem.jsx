/**
 * 🏆 Reputation System - Celebrate Your Contributions!
 * Now with Portable Reputation Passport Export!
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../styles/designSystem'
import api from '../services/api'

import ImpactMeterWidget from '../components/ImpactMeterWidget'
import { useToast } from '../components/Toast'
import './ReputationSystem.css'

const ReputationSystem = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reputationData, setReputationData] = useState({
    score: 0,
    level: 1,
    rank: '-',
    nextLevel: { level: 2, requiredScore: 100, progress: 0 },
    badges: [],
    activity: []
  })

  useEffect(() => {
    const fetchReputation = async () => {
      try {
        if (user?.id) {
          const res = await api.reputation.getProfile(user.id);
          if (res.data) setReputationData(res.data);
        }
      } catch {
        setError('Failed to load reputation data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchReputation();
  }, [user]);

  const getLevelEmoji = (level) => {
    if (level >= 30) return '👑'
    if (level >= 25) return '🌟'
    if (level >= 20) return '🏅'
    if (level >= 15) return '🔷'
    if (level >= 10) return '💎'
    return '🌱'
  }

  // Export Creator Passport
  const exportPassport = async (format = 'json') => {
    try {
      const res = await api.reputation.exportPassport();
      const passport = res.data;

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(passport, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reputation-passport-${user?.name?.replace(/\s+/g, '-').toLowerCase() || 'user'}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === 'pdf') {
        generatePDFPassport(passport)
      }
    } catch {
      toast.error('Failed to generate export.');
    }
  }

  const generatePDFPassport = async (passport) => {
    const html2pdf = (await import('html2pdf.js')).default;
    const html = `
      <div style="font-family: 'Inter var', sans-serif; padding: 40px; background: #f0fdf4; width: 600px; border-radius: 12px;">
        <h1 style="color: #16a34a; text-align: center;">🏆 JamiiLink Reputation Passport</h1>
        <p><strong>Name:</strong> ${passport.name}</p>
        <p><strong>Score:</strong> ${passport.metrics.total_score} points (Level ${passport.metrics.level})</p>
        <p><strong>Rank:</strong> ${passport.metrics.rank}</p>
        <p><strong>Verified Since:</strong> ${new Date(passport.verified_since).toLocaleDateString()}</p>
        <h2>Activity</h2>
        <ul>
          ${passport.works.map(w => `<li>${w.count} ${w.label}</li>`).join('')}
        </ul>
        <h2>Badges</h2>
        <div>
          ${passport.badges.map(b => `<span style="display: inline-block; background: #dcfce7; padding: 8px 16px; margin: 5px; border-radius: 20px;">${b.title}</span>`).join('')}
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #64748b; text-align: center;">Signature: ${passport.signature}</p>
      </div>
    `
    const element = document.createElement('div')
    element.innerHTML = html
    document.body.appendChild(element)
    
    html2pdf().from(element).save(`reputation-passport-${passport.name.replace(/\\s+/g, '-').toLowerCase()}.pdf`).then(() => {
      document.body.removeChild(element)
    })
  }

  if (loading) {
    return (
      <div className="reputation-loading" aria-live="polite">
        <div className="loading-spinner"></div>
        <p>Calculating your awesomeness... ✨</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-state" role="alert">
        <p>{error}</p>
        <button onClick={() => { setError(null); setLoading(true); window.location.reload(); }}>Try Again</button>
      </div>
    )
  }

  return (
    <main className="reputation-system" role="main" aria-label="Reputation system">
      <motion.div 
        className="reputation-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>🏆 Your Reputation</h1>
        <p>Celebrating your contributions to the Jamii!</p>
      </motion.div>

      {user?.id && <ImpactMeterWidget userId={user.id} />}

      <motion.div 
        className="level-display"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="level-badge">
          <span className="level-emoji">{getLevelEmoji(reputationData.level)}</span>
          <span className="level-number">{reputationData.level}</span>
          <span className="level-rank">{reputationData.rank}</span>
        </div>
      </motion.div>

      <motion.div 
        className="score-display"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className="score-value">{reputationData.score.toFixed(0)}</span>
        <span className="score-label">Reputation Points</span>
      </motion.div>

      <div className="reputation-tabs">
        {['overview', 'badges', 'leaderboard', 'passport'].map(tab => (
          <motion.button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            whileHover={{ scale: 1.05 }}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'badges' && '🎖️ Badges'}
            {tab === 'leaderboard' && '🏆 Leaderboard'}
            {tab === 'passport' && '🪪 Passport'}
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
            <div className="progress-section">
              <div className="progress-info">
                <span>Level {reputationData.level} → {reputationData.nextLevel.level}</span>
                <span>{reputationData.nextLevel.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${reputationData.nextLevel.progress}%`,
                    background: `linear-gradient(90deg, ${colors.primary[500]}, ${colors.accent[500]})`
                  }}
                ></div>
              </div>
            </div>

            <div className="activity-grid">
              {reputationData.activity.map((item, idx) => (
                <motion.div 
                  key={item.type}
                  className="activity-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="activity-icon">
                    {item.type === 'post' && '📝'}
                    {item.type === 'reply' && '💬'}
                    {item.type === 'event' && '🎪'}
                  </div>
                  <div>
                    <strong>{item.count}</strong>
                    <span>{item.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'badges' && (
          <motion.div 
            key="badges"
            className="badges-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="badges-grid">
              {reputationData.badges.map((badge) => (
                <motion.div 
                  key={badge.id} 
                  className={`badge-card ${badge.earned ? '' : 'locked'}`}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="badge-icon">{badge.icon}</div>
                  <h3>{badge.name}</h3>
                  <p>{badge.description}</p>
                  {badge.earned && badge.earnedDate && (
                    <small>Earned {new Date(badge.earnedDate).toLocaleDateString()}</small>
                  )}
                  {badge.earned && <div className="badge-check">✓</div>}
                  {!badge.earned && <div className="badge-lock">🔒</div>}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div 
            key="leaderboard"
            className="leaderboard-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank 🏆</th>
                  <th>Member</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                <tr className="user-row">
                  <td><strong>#3</strong> 🥉</td>
                  <td>You!</td>
                  <td>{reputationData.score.toFixed(0)}</td>
                </tr>
                <tr>
                  <td>#4</td>
                  <td>Sarah J. 👩‍💻</td>
                  <td>2654</td>
                </tr>
                <tr>
                  <td>#5</td>
                  <td>Mike C. 👨‍🌾</td>
                  <td>2401</td>
                </tr>
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === 'passport' && (
          <motion.div 
            key="passport"
            className="passport-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="passport-preview">
              <h3>🪪 Reputation Passport</h3>
              <p>Export your achievements for LinkedIn, portfolios, or grant applications!</p>
              
              <div className="passport-stats">
                <div className="passport-stat">
                  <span className="stat-icon">🏆</span>
                  <span>{reputationData.score.toFixed(0)} points</span>
                </div>
                <div className="passport-stat">
                  <span className="stat-icon">📊</span>
                  <span>Level {reputationData.level} creator</span>
                </div>
                <div className="passport-stat">
                  <span className="stat-icon">🎖️</span>
                  <span>{reputationData.badges.filter(b => b.earned).length} badges earned</span>
                </div>
              </div>

              <div className="passport-actions">
                <motion.button
                  className="btn-primary"
                  onClick={() => exportPassport('json')}
                  whileHover={{ scale: 1.05 }}
                >
                  📥 Export JSON
                </motion.button>
                <motion.button
                  className="btn-secondary"
                  onClick={() => exportPassport('pdf')}
                  whileHover={{ scale: 1.05 }}
                >
                  🖨️ Print PDF
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default ReputationSystem