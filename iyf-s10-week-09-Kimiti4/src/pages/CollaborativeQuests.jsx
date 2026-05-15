/**
 * 🎯 Collaborative Quests System
 * Features: Team Missions, Community Challenges, Cooperative Rewards
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './CollaborativeQuests.css';

const CollaborativeQuests = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(true);

  // Mock quests data - Replace with actual API calls
  const [questsData, setQuestsData] = useState({
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
      },
      {
        id: 3,
        title: 'Event Extravaganza',
        description: 'Host 20 community events in one week',
        icon: '🎪',
        category: 'Events',
        participants: 18,
        targetParticipants: 25,
        progress: 12,
        targetProgress: 20,
        reward: 'Event Champion Badge + 1000 Reputation Points',
        deadline: Date.now() + 86400000 * 3,
        team: ['You', 'Lisa P.', 'David K.', '+15 others'],
        status: 'in-progress'
      }
    ],
    completedQuests: [
      {
        id: 4,
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
      },
      {
        id: 5,
        title: 'Content Creation Sprint',
        description: 'Publish 100 quality posts in 48 hours',
        icon: '✍️',
        category: 'Content',
        participants: 42,
        progress: 100,
        targetProgress: 100,
        reward: 'Content Creator Badge + 400 Reputation Points',
        completedDate: Date.now() - 86400000 * 12,
        yourContribution: 'Published 8 posts'
      }
    ],
    upcomingQuests: [
      {
        id: 6,
        title: 'Global Outreach Challenge',
        description: 'Connect with members from 50 different countries',
        icon: '🌍',
        category: 'Networking',
        startDate: Date.now() + 86400000 * 7,
        estimatedDuration: '2 weeks',
        previewReward: 'Global Connector Badge + 600 Reputation Points'
      },
      {
        id: 7,
        title: 'Innovation Hackathon',
        description: 'Build 10 new features or tools for the community',
        icon: '💡',
        category: 'Development',
        startDate: Date.now() + 86400000 * 14,
        estimatedDuration: '1 week',
        previewReward: 'Innovator Badge + 800 Reputation Points'
      }
    ]
  });

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const formatDate = (timestamp) => {
    const diff = timestamp - Date.now();
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return 'Ends today';
    if (days === 1) return 'Ends tomorrow';
    return `Ends in ${days} days`;
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#4caf50';
    if (progress >= 75) return '#667eea';
    if (progress >= 50) return '#ffd93d';
    return '#ff6b6b';
  };

  if (loading) {
    return (
      <div className="quests-loading">
        <div className="loading-spinner"></div>
        <p>Loading quests...</p>
      </div>
    );
  }

  return (
    <div className="collaborative-quests">
      {/* Header */}
      <div className="quests-header">
        <div className="header-content">
          <h1>🎯 Collaborative Quests</h1>
          <p>Team up with the community to achieve amazing goals together!</p>
        </div>
        <div className="quest-stats">
          <div className="stat-item">
            <span className="stat-value">{questsData.activeQuests.length}</span>
            <span className="stat-label">Active Quests</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{questsData.completedQuests.length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="quests-tabs">
        <button 
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
           Active Quests
        </button>
        <button 
          className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
           Completed
        </button>
        <button 
          className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
           Upcoming
        </button>
      </div>

      {/* Tab Content */}
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
                <div key={quest.id} className="quest-card active">
                  <div className="quest-header">
                    <div className="quest-icon">{quest.icon}</div>
                    <div className="quest-meta">
                      <span className="quest-category">{quest.category}</span>
                      <span className="quest-status">🔥 In Progress</span>
                    </div>
                  </div>

                  <h3>{quest.title}</h3>
                  <p className="quest-description">{quest.description}</p>

                  <div className="quest-progress-section">
                    <div className="progress-info">
                      <span>Progress</span>
                      <span>{Math.round((quest.progress / quest.targetProgress) * 100)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(quest.progress / quest.targetProgress) * 100}%`,
                          background: getProgressColor((quest.progress / quest.targetProgress) * 100)
                        }}
                      ></div>
                    </div>
                    <div className="progress-detail">
                      <span>{quest.progress} / {quest.targetProgress}</span>
                    </div>
                  </div>

                  <div className="quest-participants">
                    <div className="participants-info">
                      <span className="participants-count">
                        👥 {quest.participants} / {quest.targetParticipants} participants
                      </span>
                    </div>
                    <div className="team-preview">
                      {quest.team.slice(0, 3).map((member, idx) => (
                        <span key={idx} className="team-member">{member}</span>
                      ))}
                    </div>
                  </div>

                  <div className="quest-reward">
                    <span className="reward-icon">🎁</span>
                    <span className="reward-text">{quest.reward}</span>
                  </div>

                  <div className="quest-footer">
                    <span className="quest-deadline">⏰ {formatDate(quest.deadline)}</span>
                    <button className="btn-join-quest">Join Quest</button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'completed' && (
            <motion.div 
              key="completed"
              className="quests-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {questsData.completedQuests.map((quest) => (
                <div key={quest.id} className="quest-card completed">
                  <div className="quest-header">
                    <div className="quest-icon">{quest.icon}</div>
                    <div className="quest-meta">
                      <span className="quest-category">{quest.category}</span>
                      <span className="quest-status">✅ Completed</span>
                    </div>
                  </div>

                  <h3>{quest.title}</h3>
                  <p className="quest-description">{quest.description}</p>

                  <div className="quest-completion">
                    <div className="completion-badge">
                      <span className="badge-icon">✓</span>
                      <span className="badge-text">Quest Complete!</span>
                    </div>
                    <div className="your-contribution">
                      <strong>Your Contribution:</strong> {quest.yourContribution}
                    </div>
                  </div>

                  <div className="quest-reward earned">
                    <span className="reward-icon">🎁</span>
                    <span className="reward-text">{quest.reward}</span>
                  </div>

                  <div className="quest-footer">
                    <span className="quest-completed-date">
                      Completed {new Date(quest.completedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'upcoming' && (
            <motion.div 
              key="upcoming"
              className="quests-grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {questsData.upcomingQuests.map((quest) => (
                <div key={quest.id} className="quest-card upcoming">
                  <div className="quest-header">
                    <div className="quest-icon">{quest.icon}</div>
                    <div className="quest-meta">
                      <span className="quest-category">{quest.category}</span>
                      <span className="quest-status">📅 Coming Soon</span>
                    </div>
                  </div>

                  <h3>{quest.title}</h3>
                  <p className="quest-description">{quest.description}</p>

                  <div className="quest-preview">
                    <div className="preview-info">
                      <span className="info-label">Starts:</span>
                      <span className="info-value">{new Date(quest.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="preview-info">
                      <span className="info-label">Duration:</span>
                      <span className="info-value">{quest.estimatedDuration}</span>
                    </div>
                  </div>

                  <div className="quest-reward preview">
                    <span className="reward-icon">🎁</span>
                    <span className="reward-text">{quest.previewReward}</span>
                  </div>

                  <div className="quest-footer">
                    <button className="btn-notify-me">Notify Me</button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CollaborativeQuests;
