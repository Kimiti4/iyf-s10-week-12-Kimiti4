/**
 * 🤝 Skill Matcher - DevSwapKE Feature Page
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { SKILL_CATEGORIES, getSkillMatches, createSkillProfile } from '../models/SkillMatch'
import SkillMatchCard from '../components/SkillMatchCard'
import ImpactMeter from '../components/ImpactMeter'
import { useToast } from '../components/Toast'
import { colors } from '../styles/designSystem'
import './SkillMatcher.css'

const SkillMatcher = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('matches')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProfileForm, setShowProfileForm] = useState(false)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    const data = await getSkillMatches(user?.id)
    setMatches(data)
    setLoading(false)
  }

  const handleConnect = (matchedUserId) => {
    toast.success(`Connection request sent to user ${matchedUserId}! 🎉`)
  }

  const handleCreateProfile = async () => {
    // Navigate to profile creation or show form
    setShowProfileForm(true)
  }

  if (loading) {
    return (
      <div className="skill-matcher-loading">
        <div className="loading-spinner"></div>
        <p>Finding skill partners... 🔍</p>
      </div>
    )
  }

  return (
    <div className="skill-matcher">
      <motion.div
        className="matcher-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>🤝 Skill Matcher</h1>
        <p>Trade skills, learn, and grow together! #DevSwapKE</p>
      </motion.div>

      <div className="matcher-tabs">
        <button
          className={`tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          🎯 Your Matches
        </button>
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          📝 Your Profile
        </button>
        <button
          className={`tab ${activeTab === 'impact' ? 'active' : ''}`}
          onClick={() => setActiveTab('impact')}
        >
          📊 Impact
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'matches' && (
          <motion.div
            key="matches"
            className="matches-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="matches-grid">
              {matches.length === 0 ? (
                <div className="no-matches">
                  <span>🔍</span>
                  <h3>No matches yet!</h3>
                  <p>Create your skill profile to get matched</p>
                  <button className="btn-primary" onClick={handleCreateProfile}>
                    Create Profile 🎯
                  </button>
                </div>
              ) : (
                matches.map((match, idx) => (
                  <SkillMatchCard key={match.userId} match={match} onConnect={handleConnect} />
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            className="profile-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="skill-profile-form">
              <h3>Create Your Skill Profile</h3>
              
              <div className="form-group">
                <label>Skills You Offer 🎁</label>
                <input placeholder="e.g., React, Web Design, Tutoring..." />
              </div>

              <div className="form-group">
                <label>Skills You Want 🤝</label>
                <input placeholder="e.g., Mobile Dev, Marketing..." />
              </div>

              <motion.button
                className="btn-primary"
                onClick={() => toast.success('Profile saved! 🎉')}
                whileHover={{ scale: 1.05 }}
              >
                Save Profile ✨
              </motion.button>
            </div>
          </motion.div>
        )}

        {activeTab === 'impact' && (
          <motion.div
            key="impact"
            className="impact-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ImpactMeter userId={user?.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SkillMatcher