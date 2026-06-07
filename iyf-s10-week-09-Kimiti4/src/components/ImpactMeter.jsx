/**
 * 📊 Impact Meter Widget - Visual community impact tracker
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { colors } from '../styles/designSystem'

const ImpactMeter = ({ userId, compact = false }) => {
  const [impact, setImpact] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch impact data
    setTimeout(() => {
      setImpact({
        monthlyImpact: 247,
        impactRank: '#12 in Nairobi',
        breakdown: {
          helpProvided: 120,
          exchangeValue: 5200,
          timeSaved: 42,
          peopleHelped: 23
        }
      })
      setLoading(false)
    }, 500)
  }, [userId])

  if (loading) {
    return (
      <div className="impact-loading">
        <div className="loading-spinner"></div>
        <p>Calculating your impact... ✨</p>
      </div>
    )
  }

  if (compact) {
    return (
      <motion.div
        className="impact-meter-compact"
        whileHover={{ scale: 1.05 }}
        style={{ backgroundColor: `${colors.primary[500]}20` }}
      >
        <span className="impact-icon">📊</span>
        <span className="impact-value">{impact.monthlyImpact}</span>
        <span className="impact-label">impact points</span>
      </motion.div>
    )
  }

  return (
    <div className="impact-meter">
      <h3>📊 Community Impact Meter</h3>
      
      <div className="impact-score">
        <span className="impact-number">{impact.monthlyImpact}</span>
        <span className="impact-rank">{impact.impactRank}</span>
      </div>

      <div className="impact-breakdown">
        <div className="impact-item">
          <span>🤝 {impact.breakdown.peopleHelped}</span>
          <span>Helped</span>
        </div>
        <div className="impact-item">
          <span>💰 KSh {impact.breakdown.exchangeValue}</span>
          <span>Exchanged</span>
        </div>
        <div className="impact-item">
          <span>⏰ {impact.breakdown.timeSaved}h</span>
          <span>Time Saved</span>
        </div>
      </div>
    </div>
  )
}

export default ImpactMeter