/**
 * ⚙️ Your Settings - Make It Your Space!
 */

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { colors } from '../styles/designSystem'
import './Settings.css'

function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }
  
  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤', color: colors.primary[500] },
    { id: 'security', label: 'Security', icon: '🔒', color: colors.danger },
    { id: 'privacy', label: 'Privacy', icon: '🛡️', color: '#667eea' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', color: colors.accent[500] },
    { id: 'appearance', label: 'Appearance', icon: '🎨', color: colors.primary[600] }
  ]
  
  return (
    <div className="settings-page">
      <motion.div 
        className="settings-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>⚙️ Account Settings</h1>
        <p>Customize your JamiiLink experience</p>
      </motion.div>
      
      {message.text && (
        <motion.div 
          className={`alert alert-${message.type}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </motion.div>
      )}
      
      <div className="settings-layout">
        <motion.div 
          className="settings-tabs"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ x: 5 }}
              style={{ 
                color: activeTab === tab.id ? tab.color : 'inherit'
              }}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>
        
        <div className="settings-content">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                className="settings-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2>👤 Profile Information</h2>
                <div className="form-group">
                  <label>Avatar</label>
                  <div className="avatar-selector">
                    {['🦁', '👑', '🐘', '🦒', '🐅', '🦅', '🐢', '🌟'].map(icon => (
                      <motion.button
                        key={icon}
                        type="button"
                        className="avatar-option"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                      >
                        {icon}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" defaultValue={user?.name || ''} />
                  </div>
                  <div className="form-group">
                    <label>Username</label>
                    <input type="text" defaultValue={user?.username || ''} />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Bio</label>
                  <textarea rows="3" placeholder="Tell us your story..." />
                </div>
                
                <motion.button 
                  className="btn-primary"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => showMessage('success', 'Profile updated!')}
                >
                  Save Changes
                </motion.button>
              </motion.div>
            )}
            
            {activeTab === 'security' && (
              <motion.div 
                key="security"
                className="settings-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2>🔒 Security Settings</h2>
                <div className="security-card">
                  <h3>Change Password</h3>
                  <input type="password" placeholder="Current password" />
                  <input type="password" placeholder="New password" />
                  <input type="password" placeholder="Confirm new password" />
                  <motion.button className="btn-primary" whileHover={{ scale: 1.02 }}>
                    Update Password
                  </motion.button>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'privacy' && (
              <motion.div 
                key="privacy"
                className="settings-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2>🛡️ Privacy Settings</h2>
                <div className="privacy-options">
                  <div className="privacy-item">
                    <div>
                      <h4>Profile Visibility</h4>
                      <p>Who can see your profile</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <motion.button className="btn-primary" whileHover={{ scale: 1.02 }}>
                    Save Privacy
                  </motion.button>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications"
                className="settings-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2>🔔 Notification Preferences</h2>
                <div className="notification-options">
                  <div className="notification-item">
                    <div>
                      <h4>Email Updates</h4>
                      <p>Weekly digest & important news</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <motion.button className="btn-primary" whileHover={{ scale: 1.02 }}>
                    Save Preferences
                  </motion.button>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'appearance' && (
              <motion.div 
                key="appearance"
                className="settings-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2>🎨 Appearance</h2>
                <div className="form-group">
                  <label>Theme</label>
                  <select>
                    <option>Light ☀️</option>
                    <option>Dark 🌙</option>
                    <option>Auto 🌈</option>
                  </select>
                </div>
                <motion.button className="btn-primary" whileHover={{ scale: 1.02 }}>
                  Save Appearance
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage