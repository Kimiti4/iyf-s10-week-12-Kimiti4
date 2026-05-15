/**
 * 🗳️ Community Governance System
 * Features: Proposals, Voting, Contribution-Weighted Influence, Transparent Logs
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './CommunityGovernance.css';

const CommunityGovernance = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('proposals');
  const [loading, setLoading] = useState(true);
  const [showNewProposal, setShowNewProposal] = useState(false);

  // Mock governance data - Replace with actual API calls
  const [governanceData, setGovernanceData] = useState({
    votingPower: 7.5,
    proposals: [
      {
        id: 1,
        title: 'Add Dark Mode to Platform',
        description: 'Implement dark mode theme option for better nighttime browsing experience',
        category: 'Feature Request',
        author: 'Sarah M.',
        status: 'voting',
        created: Date.now() - 86400000 * 3,
        votingEnds: Date.now() + 86400000 * 4,
        votesFor: 142,
        votesAgainst: 23,
        discussionPeriod: true,
        userVoted: null
      },
      {
        id: 2,
        title: 'Community Guidelines Update',
        description: 'Update community guidelines to include AI-generated content policies',
        category: 'Policy',
        author: 'Admin Team',
        status: 'voting',
        created: Date.now() - 86400000 * 5,
        votingEnds: Date.now() + 86400000 * 2,
        votesFor: 98,
        votesAgainst: 45,
        discussionPeriod: false,
        userVoted: 'for'
      },
      {
        id: 3,
        title: 'Monthly Virtual Meetup',
        description: 'Host monthly virtual meetups for community members to connect',
        category: 'Event',
        author: 'John K.',
        status: 'passed',
        created: Date.now() - 86400000 * 15,
        votingEnds: Date.now() - 86400000 * 5,
        votesFor: 234,
        votesAgainst: 12,
        discussionPeriod: false,
        userVoted: 'for'
      },
      {
        id: 4,
        title: 'Reduce Platform Fees to 2%',
        description: 'Lower platform fees from 3.5% to 2% to support creators',
        category: 'Financial',
        author: 'Mike C.',
        status: 'rejected',
        created: Date.now() - 86400000 * 20,
        votingEnds: Date.now() - 86400000 * 10,
        votesFor: 89,
        votesAgainst: 178,
        discussionPeriod: false,
        userVoted: 'against'
      }
    ],
    recentDecisions: [
      { id: 1, proposal: 'Weekly Newsletter', outcome: 'passed', date: Date.now() - 86400000 * 30 },
      { id: 2, proposal: 'New Moderation Tools', outcome: 'passed', date: Date.now() - 86400000 * 45 },
      { id: 3, proposal: 'Paid Membership Tier', outcome: 'rejected', date: Date.now() - 86400000 * 60 },
    ]
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const formatDate = (timestamp) => {
    const diff = timestamp - Date.now();
    const days = Math.floor(Math.abs(diff) / 86400000);
    
    if (diff > 0) {
      return `in ${days} day${days !== 1 ? 's' : ''}`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'voting': return '#667eea';
      case 'passed': return '#4caf50';
      case 'rejected': return '#ff6b6b';
      default: return '#999';
    }
  };

  const handleVote = (proposalId, vote) => {
    setGovernanceData(prev => ({
      ...prev,
      proposals: prev.proposals.map(p => {
        if (p.id === proposalId) {
          return {
            ...p,
            userVoted: vote,
            votesFor: vote === 'for' ? p.votesFor + 1 : p.votesFor,
            votesAgainst: vote === 'against' ? p.votesAgainst + 1 : p.votesAgainst
          };
        }
        return p;
      })
    }));
  };

  if (loading) {
    return (
      <div className="governance-loading">
        <div className="loading-spinner"></div>
        <p>Loading governance dashboard...</p>
      </div>
    );
  }

  return (
    <div className="community-governance">
      {/* Header */}
      <div className="governance-header">
        <div className="header-content">
          <h1>🗳️ Community Governance</h1>
          <p>Shape the future of JamiiLink through democratic decision-making</p>
        </div>
        <div className="voting-power-card">
          <span className="power-icon">⚡</span>
          <div className="power-info">
            <span className="power-value">{governanceData.votingPower}</span>
            <span className="power-label">Your Voting Power</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="governance-tabs">
        <button 
          className={`tab-btn ${activeTab === 'proposals' ? 'active' : ''}`}
          onClick={() => setActiveTab('proposals')}
        >
           Active Proposals
        </button>
        <button 
          className={`tab-btn ${activeTab === 'decisions' ? 'active' : ''}`}
          onClick={() => setActiveTab('decisions')}
        >
           Past Decisions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
          onClick={() => setActiveTab('guide')}
        >
          📖 How It Works
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
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
                <button 
                  className="btn-new-proposal"
                  onClick={() => setShowNewProposal(true)}
                >
                   New Proposal
                </button>
              </div>

              <div className="proposals-list">
                {governanceData.proposals.map((proposal) => (
                  <div key={proposal.id} className="proposal-card">
                    <div className="proposal-header">
                      <div className="proposal-meta">
                        <span className="proposal-category">{proposal.category}</span>
                        <span 
                          className="proposal-status"
                          style={{ color: getStatusColor(proposal.status) }}
                        >
                          {proposal.status === 'voting' && '🗳️ Voting'}
                          {proposal.status === 'passed' && '✅ Passed'}
                          {proposal.status === 'rejected' && '❌ Rejected'}
                        </span>
                      </div>
                      <h3>{proposal.title}</h3>
                      <p className="proposal-author">by {proposal.author}</p>
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
                            <div 
                              className="vote-segment against"
                              style={{ 
                                width: `${(proposal.votesAgainst / (proposal.votesFor + proposal.votesAgainst)) * 100}%` 
                              }}
                            ></div>
                          </div>
                          <div className="vote-stats">
                            <span className="votes-for">👍 {proposal.votesFor} For</span>
                            <span className="votes-against">👎 {proposal.votesAgainst} Against</span>
                          </div>
                        </div>

                        {!proposal.userVoted ? (
                          <div className="vote-actions">
                            <button 
                              className="btn-vote for"
                              onClick={() => handleVote(proposal.id, 'for')}
                            >
                               Vote For
                            </button>
                            <button 
                              className="btn-vote against"
                              onClick={() => handleVote(proposal.id, 'against')}
                            >
                               Vote Against
                            </button>
                          </div>
                        ) : (
                          <div className="vote-submitted">
                            ✓ You voted {proposal.userVoted === 'for' ? 'For' : 'Against'} this proposal
                          </div>
                        )}

                        <div className="proposal-timeline">
                          <span>📅 Voting ends {formatDate(proposal.votingEnds)}</span>
                          {proposal.discussionPeriod && (
                            <span>💬 Discussion period active</span>
                          )}
                        </div>
                      </>
                    )}

                    {proposal.status !== 'voting' && (
                      <div className="proposal-result">
                        <span className="result-text">
                          Final Result: {proposal.votesFor} For vs {proposal.votesAgainst} Against
                        </span>
                        <span className="result-date">Ended {formatDate(proposal.votingEnds)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'decisions' && (
            <motion.div 
              key="decisions"
              className="decisions-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2>Past Decisions</h2>
              <div className="decisions-list">
                {governanceData.recentDecisions.map((decision) => (
                  <div key={decision.id} className="decision-item">
                    <div className="decision-info">
                      <h3>{decision.proposal}</h3>
                      <span className="decision-date">{formatDate(decision.date)}</span>
                    </div>
                    <span 
                      className="decision-outcome"
                      style={{ 
                        color: decision.outcome === 'passed' ? '#4caf50' : '#ff6b6b' 
                      }}
                    >
                      {decision.outcome === 'passed' ? '✅ Passed' : '❌ Rejected'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div 
              key="guide"
              className="guide-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2>How Community Governance Works</h2>
              
              <div className="guide-sections">
                <div className="guide-section">
                  <div className="section-icon">📝</div>
                  <div className="section-content">
                    <h3>1. Submit a Proposal</h3>
                    <p>Any member can submit a proposal for community consideration. Proposals go through a 48-hour discussion period before voting begins.</p>
                  </div>
                </div>

                <div className="guide-section">
                  <div className="section-icon">💬</div>
                  <div className="section-content">
                    <h3>2. Discussion Period</h3>
                    <p>Community members discuss the proposal, ask questions, and suggest improvements. This ensures informed voting decisions.</p>
                  </div>
                </div>

                <div className="guide-section">
                  <div className="section-icon">⚡</div>
                  <div className="section-content">
                    <h3>3. Contribution-Weighted Voting</h3>
                    <p>Your voting power is based on your contributions to the community. More active members have more influence, capped at 10x base power to prevent dominance.</p>
                  </div>
                </div>

                <div className="guide-section">
                  <div className="section-icon">📊</div>
                  <div className="section-content">
                    <h3>4. Transparent Results</h3>
                    <p>All votes are recorded publicly. Proposals need majority support to pass. Results are archived for full transparency.</p>
                  </div>
                </div>

                <div className="guide-section">
                  <div className="section-icon">✅</div>
                  <div className="section-content">
                    <h3>5. Implementation</h3>
                    <p>Passed proposals are implemented by the team. Progress updates are shared with the community regularly.</p>
                  </div>
                </div>
              </div>

              <div className="guide-note">
                <strong>Note:</strong> Your current voting power is <strong>{governanceData.votingPower}</strong>. 
                Increase your contributions to gain more influence in community decisions!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* New Proposal Modal */}
      {showNewProposal && (
        <div className="modal-overlay" onClick={() => setShowNewProposal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Proposal</h2>
            <form className="proposal-form">
              <div className="form-group">
                <label>Title</label>
                <input type="text" placeholder="Brief, descriptive title" />
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select>
                  <option>Feature Request</option>
                  <option>Policy</option>
                  <option>Event</option>
                  <option>Financial</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="5" 
                  placeholder="Describe your proposal in detail. What problem does it solve? What are the benefits?"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label>Expected Impact</label>
                <textarea 
                  rows="3" 
                  placeholder="How will this benefit the community?"
                ></textarea>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowNewProposal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                   Submit Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityGovernance;
