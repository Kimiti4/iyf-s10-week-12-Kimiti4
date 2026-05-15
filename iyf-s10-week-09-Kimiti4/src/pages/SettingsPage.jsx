import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import './Settings.css'

function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    phone: user?.phone || '',
    avatar_icon: user?.avatar_icon || '🦁'
  })

  // Security State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Privacy State
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    showOnlineStatus: true
  })

  // Notification State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    eventReminders: true,
    marketplaceUpdates: true,
    weeklyDigest: false
  })

  // Appearance State
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: 'en',
    fontSize: 'medium',
    compactMode: false
  })

  const avatarOptions = ['🦁', '👑', '🐘', '🦒', '🦓', '🐆', '🦅', '🐢', '🦋', '🌟', '⚡', '🔥']

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // TODO: Call API to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      showMessage('success', 'Profile updated successfully!')
    } catch (error) {
      showMessage('error', 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (securityData.newPassword !== securityData.confirmPassword) {
      showMessage('error', 'New passwords do not match')
      return
    }
    setLoading(true)
    try {
      // TODO: Call API to change password
      await new Promise(resolve => setTimeout(resolve, 1000))
      showMessage('success', 'Password changed successfully!')
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      showMessage('error', 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handlePrivacyUpdate = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      showMessage('success', 'Privacy settings updated!')
    } catch (error) {
      showMessage('error', 'Failed to update privacy settings')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationUpdate = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      showMessage('success', 'Notification preferences saved!')
    } catch (error) {
      showMessage('error', 'Failed to update notifications')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'privacy', label: 'Privacy', icon: '🛡️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'data', label: 'Data & Storage', icon: '💾' }
  ]

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <h1>⚙️ Account Settings</h1>
          <p>Manage your account preferences and settings</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        <div className="settings-layout">
          {/* Sidebar Tabs */}
          <div className="settings-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="settings-content">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="settings-section">
                <h2>👤 Profile Information</h2>
                <form onSubmit={handleProfileUpdate}>
                  <div className="form-group">
                    <label>Avatar</label>
                    <div className="avatar-selector">
                      {avatarOptions.map(icon => (
                        <button
                          key={icon}
                          type="button"
                          className={`avatar-option ${profileData.avatar_icon === icon ? 'selected' : ''}`}
                          onClick={() => setProfileData({ ...profileData, avatar_icon: icon })}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Username</label>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows="4"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        placeholder="Nairobi, Kenya"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="+254 7XX XXX XXX"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="settings-section">
                <h2>🔒 Security Settings</h2>
                
                <div className="security-card">
                  <h3>Change Password</h3>
                  <form onSubmit={handlePasswordChange}>
                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                        required
                        minLength="8"
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                <div className="security-card">
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                  <button className="btn-secondary">Enable 2FA</button>
                </div>

                <div className="security-card">
                  <h3>Active Sessions</h3>
                  <p>Manage devices where you're currently logged in</p>
                  <div className="session-list">
                    <div className="session-item">
                      <div className="session-info">
                        <strong>Current Device</strong>
                        <span>Chrome on Windows • Nairobi, Kenya</span>
                      </div>
                      <span className="badge-active">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="settings-section">
                <h2>🛡️ Privacy Settings</h2>
                
                <div className="privacy-options">
                  <div className="privacy-item">
                    <div className="privacy-info">
                      <h4>Profile Visibility</h4>
                      <p>Allow others to see your profile</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={privacySettings.profileVisible}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisible: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="privacy-item">
                    <div className="privacy-info">
                      <h4>Show Email Address</h4>
                      <p>Display your email on your public profile</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={privacySettings.showEmail}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, showEmail: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="privacy-item">
                    <div className="privacy-info">
                      <h4>Show Phone Number</h4>
                      <p>Display your phone number on your public profile</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={privacySettings.showPhone}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, showPhone: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="privacy-item">
                    <div className="privacy-info">
                      <h4>Allow Direct Messages</h4>
                      <p>Receive messages from other users</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={privacySettings.allowMessages}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, allowMessages: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="privacy-item">
                    <div className="privacy-info">
                      <h4>Show Online Status</h4>
                      <p>Let others see when you're online</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={privacySettings.showOnlineStatus}
                        onChange={(e) => setPrivacySettings({ ...privacySettings, showOnlineStatus: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <button className="btn-primary" onClick={handlePrivacyUpdate} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Privacy Settings'}
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h2>🔔 Notification Preferences</h2>
                
                <div className="notification-options">
                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>Email Notifications</h4>
                      <p>Receive updates via email</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>Push Notifications</h4>
                      <p>Get real-time alerts in your browser</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushNotifications}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>SMS Alerts</h4>
                      <p>Receive critical alerts via SMS</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.smsAlerts}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, smsAlerts: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>Event Reminders</h4>
                      <p>Get notified before events start</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.eventReminders}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, eventReminders: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>Marketplace Updates</h4>
                      <p>Notifications about listings and offers</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.marketplaceUpdates}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, marketplaceUpdates: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="notification-item">
                    <div className="notification-info">
                      <h4>Weekly Digest</h4>
                      <p>Summary of activity sent weekly</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={notificationSettings.weeklyDigest}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyDigest: e.target.checked })}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <button className="btn-primary" onClick={handleNotificationUpdate} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Notification Settings'}
                </button>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h2>🎨 Appearance Settings</h2>
                
                <div className="form-group">
                  <label>Theme</label>
                  <select
                    value={appearanceSettings.theme}
                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, theme: e.target.value })}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Language</label>
                  <select
                    value={appearanceSettings.language}
                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, language: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Font Size</label>
                  <select
                    value={appearanceSettings.fontSize}
                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, fontSize: e.target.value })}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="privacy-item">
                  <div className="privacy-info">
                    <h4>Compact Mode</h4>
                    <p>Show more content with less spacing</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={appearanceSettings.compactMode}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, compactMode: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <button className="btn-primary" onClick={() => showMessage('success', 'Appearance settings saved!')}>
                  Save Appearance
                </button>
              </div>
            )}

            {/* Data & Storage Tab */}
            {activeTab === 'data' && (
              <div className="settings-section">
                <h2>💾 Data & Storage</h2>
                
                <div className="data-card">
                  <h3>Storage Usage</h3>
                  <div className="storage-bar">
                    <div className="storage-used" style={{ width: '35%' }}></div>
                  </div>
                  <p>3.5 GB of 10 GB used</p>
                </div>

                <div className="data-actions">
                  <button className="btn-secondary">Download My Data</button>
                  <button className="btn-danger">Delete Account</button>
                </div>

                <div className="data-card warning">
                  <h3>⚠️ Danger Zone</h3>
                  <p>Once you delete your account, there is no going back. Please be certain.</p>
                  <button className="btn-danger">Permanently Delete Account</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
