/**
 * Settings — profile, security, privacy, notifications, appearance
 */

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import PageHeader from '../components/primitives/PageHeader'
import './Settings.css'

function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [message, setMessage] = useState({ type: '', text: '' })

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'privacy', label: 'Privacy', icon: '🛡️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
  ]

  return (
    <main className="settings-page" role="main" aria-label="Settings">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        subtitle="Profile, security, privacy, and appearance"
      />

      {message.text && (
        <motion.div
          className={`alert alert-${message.type}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
        >
          {message.text}
        </motion.div>
      )}

      <div className="settings-layout">
        <nav className="settings-tabs" role="tablist" aria-label="Settings sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="settings-content">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                className="settings-section"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                role="tabpanel"
              >
                <h2>Profile information</h2>
                <div className="form-group">
                  <label>Avatar</label>
                  <div className="avatar-selector">
                    {['🦁', '👑', '🐘', '🦒', '🐅', '🦅', '🐢', '🌟'].map(icon => (
                      <button key={icon} type="button" className="avatar-option">
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="settings-name">Full name</label>
                    <input id="settings-name" type="text" defaultValue={user?.name || ''} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="settings-username">Username</label>
                    <input id="settings-username" type="text" defaultValue={user?.username || ''} />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="settings-bio">Bio</label>
                  <textarea id="settings-bio" rows="3" placeholder="Tell your jamii about yourself..." />
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => showMessage('success', 'Profile updated')}
                >
                  Save changes
                </button>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                className="settings-section"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                role="tabpanel"
              >
                <h2>Security</h2>
                <div className="security-card">
                  <h3>Change password</h3>
                  <input type="password" placeholder="Current password" autoComplete="current-password" />
                  <input type="password" placeholder="New password" autoComplete="new-password" />
                  <input type="password" placeholder="Confirm new password" autoComplete="new-password" />
                  <button type="button" className="btn btn-primary">Update password</button>
                </div>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                className="settings-section"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                role="tabpanel"
              >
                <h2>Privacy</h2>
                <div className="privacy-options">
                  <div className="privacy-item">
                    <div>
                      <h4>Profile visibility</h4>
                      <p>Who can see your profile</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <button type="button" className="btn btn-primary">Save privacy</button>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                className="settings-section"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                role="tabpanel"
              >
                <h2>Notification preferences</h2>
                <div className="notification-options">
                  <div className="notification-item">
                    <div>
                      <h4>Email updates</h4>
                      <p>Weekly digest and important news</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <button type="button" className="btn btn-primary">Save preferences</button>
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                key="appearance"
                className="settings-section"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                role="tabpanel"
              >
                <h2>Appearance</h2>
                <div className="form-group">
                  <label htmlFor="settings-theme">Theme</label>
                  <select id="settings-theme" defaultValue="dark">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">System</option>
                  </select>
                </div>
                <button type="button" className="btn btn-primary">Save appearance</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}

export default SettingsPage
