/**
 * 🏆 Reputation Profile - Celebrate Your Achievements!
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { colors } from '../styles/designSystem'

export default function ReputationProfilePage() {
  const { userId } = useParams()
  const [reputation, setReputation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setReputation({
        score: 1250,
        badge_tier: 'gold',
        level: 8
      })
      setLoading(false)
    }, 500)
  }, [userId])

  if (loading) {
    return (
      <div className="loading-state" aria-live="polite">
        <div className="loading-spinner"></div>
        <p>Loading achievements... 🏆</p>
      </div>
    )
  }

  const badgeTiers = {
    bronze: { emoji: '🥉', label: 'Bronze', color: '#cd7f32' },
    silver: { emoji: '🥈', label: 'Silver', color: '#c0c0c0' },
    gold: { emoji: '🥇', label: 'Gold', color: '#ffd700' },
    diamond: { emoji: '💎', label: 'Diamond', color: '#b9f2ff' }
  }

  return (
    <main className="reputation-profile-page" role="main" aria-label="Reputation profile">
      <motion.div 
        className="profile-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>🏆 Your Reputation</h1>
        <p>Tier: <strong>{badgeTiers[reputation.badge_tier].emoji} {badgeTiers[reputation.badge_tier].label}</strong></p>
      </motion.div>

      <motion.div 
        className="reputation-meter"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="meter-circle">
          <span className="meter-score">{reputation.score}</span>
          <span className="meter-label">Points</span>
        </div>
      </motion.div>

      <div className="badges-section">
        <h2>Earned Badges 🎖️</h2>
        <div className="badges-grid">
          {['Helper', 'Contributor', 'Leader'].map((badge) => (
            <motion.div 
              key={badge}
              className="badge-item"
              whileHover={{ scale: 1.05 }}
            >
              <span className="badge-emoji">⭐</span>
              <span>{badge}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.button 
        className="btn-primary"
        whileHover={{ scale: 1.05 }}
      >
        Share Achievements 📤
      </motion.button>
    </main>
  )
}