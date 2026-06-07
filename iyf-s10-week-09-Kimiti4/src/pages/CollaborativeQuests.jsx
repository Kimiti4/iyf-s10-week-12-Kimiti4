/**
 * 🎪 Collaborative Quests - Adventure Awaits!
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../styles/designSystem'
import './CollaborativeQuests.css'

const CollaborativeQuests = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('active')
  const [loading, setLoading] = useState(true)

  const questsData = {
    activeQuests: [
      {
        id: 1,
        title: 'Community Knowledge Base',
        description: 'Create 100 helpful guides and tutorials for new members',
        icon: '📚',
        category: 'Education',
        participants: 47,
        targetParticipants: 50,
        progress: 68,
        targetProgress: 100,
        reward: 'Knowledge Builder Badge + 500 Reputation Points',
        deadline: Date.now() + 86400000 * 7,
        team: ['You', 'Jane D.', 'John S.', '+44 others'],
        status: 'in-progress'
      },
      {
        id: 2,
        title: 'Mentorship Marathon',
        description: 'Collectively mentor 200 newcomers this month',
        icon: '👨‍🏫',
        category: 'Mentorship',
        participants: 32,
        targetParticipants: 40,
        progress: 156,
        targetProgress: 200,
        reward: 'Master Mentor Badge + 750 Reputation Points',
        deadline: Date.now() + 86400000 * 15,
        team: ['You', 'Sarah M.', 'Mike C.', '+29 others'],
        status: 'in-progress'
      }
    ],
    completedQuests: [
      {
        id: 3,
        title: 'Welcome Committee',
        description: 'Welcome 500 new members to the community',
        icon: '👋',
        category: 'Onboarding',
        participants: 65,
        progress: 500,
        targetProgress: 500,
        reward: 'Welcoming Spirit Badge + 300 Reputation Points',
        completedDate: Date.now() - 86400000 * 5,
        yourContribution: 'Welcomed 23 members'
      }
    ],
    upcomingQuests: [
      {
        id: 4,
        title: 'Innovation Hackathon',
        description: 'Build 10 new features or tools for the community',
        icon: '💡',
        category: 'Development',
        startDate: Date.now() + 86400000 * 7,
        estimatedDuration: '1 week',
        previewReward: 'Innovator Badge + 800 Reputation Points'
      }
    ]
  }

  useEffect(() => {
    setTimeout(() => setLoading(false), 500)
  }, [])

  const formatDate = (timestamp) => {
    const diff = timestamp - Date.now()
    const days = Math.floor(diff / 86400000)
    
    if (days === 0) return 'Ends today 🎉'
    if (days === 1) return 'Ends tomorrow ⏰'
    return `Ends in ${days} days 📅`
  }

  const getProgressEmoji = (progress) => {
    if (progress >= 100) return '🏆'
    if (progress >= 75) return '🔥'
    if (progress >= 50) return '🚀'
    return '🌱'
  }

  if (loading) {
    return (
      <div className="quests-loading">
        <div className="loading-spinner"></div>
        <p>Loading your quests... 🎯</p>
      </div>
    )
  }

  return (
    <div className="collaborative-quests">
      <motion.div 
        className="quests-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content">
          <h1>🎪 Collaborative Quests</h1>
          <p>Team up with your Jamii to achieve amazing goals!</p>
        </div>
        <div className="quest-stats">
          <div className="stat-item">
            <span className="stat-value">{questsData.activeQuests.length}</span>
            <span className="stat-label">🔥 Active</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{questsData.completedQuests.length}</span>
            <span className="stat-label">🏆 Completed</span>
          </div>
        </div>
      </motion.div>

      <div className="quests-tabs">
        {['active', 'completed', 'upcoming'].map(tab => (
          <motion.button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            whileHover={{ scale: 1.05 }}
          >
            {tab === 'active' && '🔥 Active Quests'}
            {tab === 'completed' && '🏆 Completed'}
            {tab === 'upcoming' && '📅 Upcoming'}
          </motion.button>
        ))}
      </div>

      <div className="tab-content">
        <AnimatePresence mode="wait">
          {activeTab === 'active' && (
            <motion.div 
              key="active"
              className="quests-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {questsData.activeQuests.map((quest) => (
                <motion.div 
                  key={quest.id} 
                  className="quest-card active"
                  whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(102, 126, 234, 0.25)' }}
                >
                  <div className="quest-header">
                    <div className="quest-icon">{quest.icon}</div>
                    <span className="quest-category">{quest.category}</span>
                  </div>

                  <h3>{quest.title}</h3>
                  <p className="quest-description">{quest.description}</p>

                  <div className="quest-progress-section">
                    <div className="progress-info">
                      <span>Progress {getProgressEmoji(quest.progress / quest.targetProgress * 100)}</span>
                      <span>{Math.round((quest.progress / quest.targetProgress) * 100)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(quest.progress / quest.targetProgress) * 100}%`,
                          background: `linear-gradient(90deg, ${colors.primary[500]}, ${colors.accent[500]})`
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="quest-participants">
                    <span>👥 {quest.participants} / {quest.targetParticipants} adventurers</span>
                  </div>

                  <div className="quest-reward">
                    <span>🎁 {quest.reward}</span>
                  </div>

                  <div className="quest-footer">
                    <span>⏰ {formatDate(quest.deadline)}</span>
                    <motion.button className="btn-join-quest" whileHover={{ scale: 1.05 }}>
                      Join Quest 🚀
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default CollaborativeQuests