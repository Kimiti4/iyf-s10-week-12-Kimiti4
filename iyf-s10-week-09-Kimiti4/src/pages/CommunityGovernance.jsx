/**
 * 🗳️ Community Governance - Your Voice Matters!
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../styles/designSystem'
import './CommunityGovernance.css'

const CommunityGovernance = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('proposals')
  const [loading, setLoading] = useState(true)
  const [showNewProposal, setShowNewProposal] = useState(false)

  const governanceData = {
    votingPower: 7.5,
    proposals: [
      {
        id: 1,
        title: 'Add Dark Mode to Platform',
        description: 'Implement dark mode theme option for better nighttime browsing experience',
        category: 'Feature Request',
        author: 'Sarah M.',
        status: 'voting',
        votingEnds: Date.now() + 86400000 * 4,
        votesFor: 142,
        votesAgainst: 23,
        userVoted: null
      },
      {
        id: 2,
        title: 'Community Guidelines Update',
        description: 'Update community guidelines to include AI-generated content policies',
        category: 'Policy',
        author: 'Admin Team',
        status: 'voting',
        votingEnds: Date.now() + 86400000 * 2,
        votesFor: 98,
        votesAgainst: 45,
        userVoted: 'for'
      }
    ],
    recentDecisions: [
      { id: 1, proposal: 'Weekly Newsletter', outcome: 'passed', date: Date.now() - 86400000 * 30 },
      { id: 2, proposal: 'New Moderation Tools', outcome: 'passed', date: Date.now() - 86400000 * 45 }
    ]
  }

  useEffect(() => {
    setTimeout(() => setLoading(false), 500)
  }, [])

  const formatDate = (timestamp) => {
    const diff = timestamp - Date.now()
    const days = Math.floor(Math.abs(diff) / 86400000)
    
    if (diff > 0) return `in ${days} day${days !== 1 ? 's' : ''}`
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }

  const getStatusBadge = (status) => {
    if (status === 'voting') return { text: '🗳️ Voting', color: colors.info }
    if (status === 'passed') return { text: '✅ Passed', color: colors.success }
    return { text: '❌ Rejected', color: colors.danger }
  }

  if (loading) {
    return (
      <div className="governance-loading">
        <div className="loading-spinner"></div>
        <p>Loading governance magic... 🪄</p>
      </div>
    )
  }

  return (
    <main className="community-governance" role="main" aria-label="Community governance">
      <motion.div 
        className="governance-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>🗳️ Community Governance</h1>
        <p>Shape the future of JamiiLink together!</p>
        <div className="voting-power-card">
          <span className="power-icon">⚡</span>
          <div>
            <span className="power-value">{governanceData.votingPower}x</span>
            <span>Your Voting Power</span>
          </div>
        </div>
      </motion.div>

      <div className="governance-tabs">
        {['proposals', 'decisions', 'guide'].map(tab => (
          <motion.button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            whileHover={{ scale: 1.05 }}
          >
            {tab === 'proposals' && '🗳️ Active Proposals'}
            {tab === 'decisions' && '📜 Past Decisions'}
            {tab === 'guide' && '📖 How It Works'}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'proposals' && (
          <motion.div 
            key="proposals"
            className="proposals-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="proposals-header">
              <h2>Active Proposals</h2>
              <motion.button 
                className="btn-new-proposal"
                onClick={() => setShowNewProposal(true)}
                whileHover={{ scale: 1.05 }}
              >
                ✨ New Proposal
              </motion.button>
            </div>

            <div className="proposals-list">
              {governanceData.proposals.map((proposal) => (
                <motion.div 
                  key={proposal.id} 
                  className="proposal-card"
                  whileHover={{ x: 5 }}
                >
                  <div className="proposal-header">
                    <span 
                      className="proposal-status"
                      style={{ color: getStatusBadge(proposal.status).color }}
                    >
                      {getStatusBadge(proposal.status).text}
                    </span>
                    <h3>{proposal.title}</h3>
                    <p className="proposal-author">by {proposal.author} ✨</p>
                  </div>

                  <p className="proposal-description">{proposal.description}</p>

                  {proposal.status === 'voting' && (
                    <>
                      <div className="voting-progress">
                        <div className="vote-bar">
                          <div 
                            className="vote-segment for"
                            style={{ 
                              width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <div className="vote-stats">
                          <span>👍 {proposal.votesFor} For</span>
                          <span>👎 {proposal.votesAgainst} Against</span>
                        </div>
                      </div>

                      {!proposal.userVoted ? (
                        <div className="vote-actions">
                          <motion.button className="btn-vote for" whileHover={{ scale: 1.05 }}>
                            👍 Vote For
                          </motion.button>
                          <motion.button className="btn-vote against" whileHover={{ scale: 1.05 }}>
                            👎 Vote Against
                          </motion.button>
                        </div>
                      ) : (
                        <div className="vote-submitted">
                          ✅ You voted {proposal.userVoted === 'for' ? 'For' : 'Against'} this proposal
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showNewProposal && (
        <motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowNewProposal(false)}
        >
          <motion.div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2>Create New Proposal</h2>
            <form className="proposal-form">
              <input type="text" placeholder="Your proposal title..." />
              <textarea placeholder="Describe your idea..." rows="4" />
              <motion.button 
                type="submit" 
                className="btn-primary"
                whileHover={{ scale: 1.02 }}
              >
                Submit Proposal 🚀
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </main>
  )
}

export default CommunityGovernance