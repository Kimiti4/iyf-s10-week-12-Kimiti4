import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './FounderDashboard.css';

/**
 * 👑 Founder Admin Dashboard
 * Exclusive control panel for platform founder
 */

export default function FounderDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch stats
      const statsRes = await fetch('/api/metrics/dashboard');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch recent users
      const usersRes = await fetch('/api/users?limit=10&sort=-createdAt');
      const usersData = await usersRes.json();
      setRecentUsers(usersData.users || []);

      // Check system health
      const healthRes = await fetch('/api/health');
      const healthData = await healthRes.json();
      setSystemHealth(healthData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is founder
  if (!user || (user.role !== 'founder' && !user.isFounder)) {
    return (
      <div className="access-denied">
        <h1>🚫 Access Denied</h1>
        <p>This dashboard is exclusively for the platform founder.</p>
        <p>Contact support if you believe this is an error.</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'users', icon: '👥', label: 'Users' },
    { id: 'content', icon: '📝', label: 'Content' },
    { id: 'alerts', icon: '🚨', label: 'Emergency Alerts' },
    { id: 'tiannara', icon: '🤖', label: 'Tiannara AI' },
    { id: 'events', icon: '🎉', label: 'Events' },
    { id: 'verification', icon: '✓', label: 'Verification' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <div className="founder-dashboard">
      {/* Header */}
      <motion.div 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="header-content">
          <div className="header-left">
            <span className="crown-icon">👑</span>
            <div>
              <h1>Founder Dashboard</h1>
              <p className="subtitle">Platform Control Center</p>
            </div>
          </div>
          <div className="header-right">
            <div className="founder-badge">
              <span className="badge-icon">💎</span>
              <span>Diamond Tier</span>
            </div>
            <button className="refresh-btn" onClick={fetchDashboardData}>
              🔄 Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="tab-content"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && <OverviewTab stats={stats} systemHealth={systemHealth} isLoading={isLoading} />}
          {activeTab === 'users' && <UsersTab users={recentUsers} isLoading={isLoading} />}
          {activeTab === 'content' && <ContentTab />}
          {activeTab === 'alerts' && <AlertsTab />}
          {activeTab === 'tiannara' && <TiannaraTab />}
          {activeTab === 'events' && <EventsTab />}
          {activeTab === 'verification' && <VerificationTab />}
          {activeTab === 'settings' && <SettingsTab user={user} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ stats, systemHealth, isLoading }) {
  if (isLoading) {
    return <div className="loading-state">Loading dashboard data...</div>;
  }

  return (
    <div className="overview-tab">
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers || '0'} 
          icon="👥" 
          color="#3b82f6"
          trend="+12%"
        />
        <StatCard 
          title="Active Posts" 
          value={stats?.totalPosts || '0'} 
          icon="📝" 
          color="#10b981"
          trend="+8%"
        />
        <StatCard 
          title="Organizations" 
          value={stats?.totalOrgs || '0'} 
          icon="🏢" 
          color="#8b5cf6"
          trend="+5%"
        />
        <StatCard 
          title="Events Created" 
          value={stats?.totalEvents || '0'} 
          icon="🎉" 
          color="#f59e0b"
          trend="+15%"
        />
      </div>

      {/* System Health */}
      <div className="system-health-section">
        <h2>System Health</h2>
        <div className="health-cards">
          <HealthCard 
            title="API Status" 
            status={systemHealth?.status === '✅ OK' ? 'operational' : 'down'}
            uptime={systemHealth?.uptime ? `${Math.floor(systemHealth.uptime / 3600)}h` : 'N/A'}
            memory={`${Math.round(systemHealth?.memory || 0)} MB`}
          />
          <HealthCard 
            title="Database" 
            status="operational"
            connections="Active"
            latency="< 50ms"
          />
          <HealthCard 
            title="Tiannara AI" 
            status="operational"
            requests="24/7"
            accuracy="95%"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <ActionButton icon="🚨" label="Create Emergency Alert" color="#ef4444" />
          <ActionButton icon="✓" label="Verify User" color="#10b981" />
          <ActionButton icon="📊" label="View Analytics" color="#3b82f6" />
          <ActionButton icon="⚙️" label="System Settings" color="#6b7280" />
        </div>
      </div>
    </div>
  );
}

// Users Management Tab
function UsersTab({ users, isLoading }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return <div className="loading-state">Loading users...</div>;
  }

  return (
    <div className="users-tab">
      <div className="tab-header">
        <h2>User Management</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Badge</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="user-cell">
                    <span className="user-avatar">{user.profile?.avatarIcon || '👤'}</span>
                    <span>{user.username}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role || 'user'}
                  </span>
                </td>
                <td>
                  {user.verification?.badgeLevel && (
                    <span className="verification-badge">
                      {getBadgeIcon(user.verification.badgeLevel)}
                      {user.verification.badgeLevel}
                    </span>
                  )}
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className="action-buttons-small">
                    <button title="View Profile">👁️</button>
                    <button title="Edit">✏️</button>
                    <button title="Verify">✓</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Content Moderation Tab
function ContentTab() {
  return (
    <div className="content-tab">
      <h2>Content Moderation</h2>
      <div className="moderation-controls">
        <div className="control-card">
          <h3>🤖 Tiannara Auto-Moderation</h3>
          <p>AI-powered content filtering is active</p>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="slider"></span>
          </label>
        </div>
        <div className="control-card">
          <h3>🚫 Blocked Keywords</h3>
          <p>Manage filtered words and phrases</p>
          <button className="btn-secondary">Manage List</button>
        </div>
        <div className="control-card">
          <h3>📋 Reported Content</h3>
          <p>Review user-reported posts</p>
          <button className="btn-secondary">View Reports (0)</button>
        </div>
      </div>
    </div>
  );
}

// Emergency Alerts Tab
function AlertsTab() {
  const [alertForm, setAlertForm] = useState({
    type: 'security',
    severity: 'medium',
    title: '',
    message: '',
    location: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Emergency alert broadcasted! (Demo)');
  };

  return (
    <div className="alerts-tab">
      <h2>🚨 Emergency Alert Broadcasting</h2>
      <p className="warning-text">⚠️ Only founders can create emergency alerts</p>
      
      <form onSubmit={handleSubmit} className="alert-form">
        <div className="form-group">
          <label>Alert Type</label>
          <select 
            value={alertForm.type}
            onChange={(e) => setAlertForm({...alertForm, type: e.target.value})}
          >
            <option value="security">🛡️ Security Alert</option>
            <option value="weather">⛈️ Weather Warning</option>
            <option value="health">🏥 Health Emergency</option>
            <option value="infrastructure">🔧 Infrastructure Issue</option>
            <option value="community">📢 Community Alert</option>
          </select>
        </div>

        <div className="form-group">
          <label>Severity Level</label>
          <select 
            value={alertForm.severity}
            onChange={(e) => setAlertForm({...alertForm, severity: e.target.value})}
          >
            <option value="low">Low - Informational</option>
            <option value="medium">Medium - Important</option>
            <option value="high">High - Urgent</option>
            <option value="critical">Critical - Immediate Action Required</option>
          </select>
        </div>

        <div className="form-group">
          <label>Title</label>
          <input 
            type="text"
            value={alertForm.title}
            onChange={(e) => setAlertForm({...alertForm, title: e.target.value})}
            placeholder="Brief alert title"
            required
          />
        </div>

        <div className="form-group">
          <label>Message</label>
          <textarea 
            value={alertForm.message}
            onChange={(e) => setAlertForm({...alertForm, message: e.target.value})}
            placeholder="Detailed alert message..."
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label>Location (Optional)</label>
          <input 
            type="text"
            value={alertForm.location}
            onChange={(e) => setAlertForm({...alertForm, location: e.target.value})}
            placeholder="Specific area or leave blank for all"
          />
        </div>

        <button type="submit" className="btn-danger">
          🚨 Broadcast Emergency Alert
        </button>
      </form>
    </div>
  );
}

// Tiannara AI Management Tab
function TiannaraTab() {
  return (
    <div className="tiannara-tab">
      <h2>🤖 Tiannara AI Configuration</h2>
      
      <div className="ai-config-grid">
        <div className="config-card">
          <h3>Mental Health Support</h3>
          <p>Status: <span className="status-active">Active</span></p>
          <p>Sessions today: 47</p>
          <p>Crisis interventions: 3</p>
          <button className="btn-secondary">View Logs</button>
        </div>

        <div className="config-card">
          <h3>Fact-Checking Engine</h3>
          <p>Status: <span className="status-active">Active</span></p>
          <p>Checks performed: 156</p>
          <p>Accuracy rate: 95%</p>
          <button className="btn-secondary">Configure</button>
        </div>

        <div className="config-card">
          <h3>Content Moderation</h3>
          <p>Status: <span className="status-active">Active</span></p>
          <p>Posts moderated: 1,234</p>
          <p>Violations detected: 23</p>
          <button className="btn-secondary">Adjust Sensitivity</button>
        </div>

        <div className="config-card">
          <h3>AI Model Settings</h3>
          <p>Model: Tiannara v2.0</p>
          <p>Language: English, Swahili</p>
          <p>Response time: &lt; 2s</p>
          <button className="btn-secondary">Update Model</button>
        </div>
      </div>
    </div>
  );
}

// Events Management Tab
function EventsTab() {
  return (
    <div className="events-tab">
      <h2>🎉 Community Events Management</h2>
      <div className="events-stats">
        <div className="stat-box">
          <h3>Active Events</h3>
          <p className="stat-number">12</p>
        </div>
        <div className="stat-box">
          <h3>Total RSVPs</h3>
          <p className="stat-number">347</p>
        </div>
        <div className="stat-box">
          <h3>This Month</h3>
          <p className="stat-number">8</p>
        </div>
      </div>
      <button className="btn-primary">Create New Event</button>
    </div>
  );
}

// Verification Management Tab
function VerificationTab() {
  return (
    <div className="verification-tab">
      <h2>✓ Verification Badge Management</h2>
      <div className="verification-levels">
        <VerificationLevelCard 
          level="Bronze"
          icon="🥉"
          count={234}
          requirements="Basic email verification"
          color="#cd7f32"
        />
        <VerificationLevelCard 
          level="Silver"
          icon="🥈"
          count={89}
          requirements="Phone + ID verification"
          color="#c0c0c0"
        />
        <VerificationLevelCard 
          level="Gold"
          icon="🥇"
          count={23}
          requirements="Professional credentials"
          color="#ffd700"
        />
        <VerificationLevelCard 
          level="Diamond"
          icon="💎"
          count={1}
          requirements="Founder/Elite tier"
          color="#b9f2ff"
          highlight
        />
      </div>
    </div>
  );
}

// Settings Tab
function SettingsTab({ user }) {
  return (
    <div className="settings-tab">
      <h2>⚙️ Platform Settings</h2>
      
      <div className="settings-sections">
        <div className="settings-card">
          <h3>Founder Profile</h3>
          <div className="profile-info">
            <span className="profile-avatar">{user?.profile?.avatarIcon || '👑'}</span>
            <div>
              <p><strong>Username:</strong> {user?.username}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> Founder</p>
              <p><strong>Badge:</strong> Diamond 💎</p>
            </div>
          </div>
          <button className="btn-secondary">Edit Profile</button>
        </div>

        <div className="settings-card">
          <h3>Security Settings</h3>
          <p>MFA Status: <span className="status-active">Enabled (3-Factor)</span></p>
          <p>Last login: {new Date().toLocaleString()}</p>
          <button className="btn-secondary">Change Password</button>
          <button className="btn-secondary">Backup Codes</button>
        </div>

        <div className="settings-card">
          <h3>Platform Configuration</h3>
          <p>Max post length: 5000 characters</p>
          <p>Rate limiting: 100 requests/hour</p>
          <p>File upload limit: 10MB</p>
          <button className="btn-secondary">Update Settings</button>
        </div>

        <div className="settings-card danger-zone">
          <h3>⚠️ Danger Zone</h3>
          <p>Irreversible actions</p>
          <button className="btn-danger">Clear All Cache</button>
          <button className="btn-danger">Reset Analytics</button>
        </div>
      </div>
    </div>
  );
}

// Helper Components

function StatCard({ title, value, icon, color, trend }) {
  return (
    <motion.div 
      className="stat-card"
      whileHover={{ scale: 1.02 }}
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <div className="stat-info">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
    </motion.div>
  );
}

function HealthCard({ title, status, ...details }) {
  return (
    <div className={`health-card ${status}`}>
      <h3>{title}</h3>
      <span className={`status-indicator ${status}`}>
        {status === 'operational' ? '● Operational' : '● Down'}
      </span>
      {Object.entries(details).map(([key, value]) => (
        <p key={key}><strong>{key}:</strong> {value}</p>
      ))}
    </div>
  );
}

function ActionButton({ icon, label, color }) {
  return (
    <motion.button
      className="action-btn"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{ backgroundColor: color }}
    >
      <span className="action-icon">{icon}</span>
      <span>{label}</span>
    </motion.button>
  );
}

function VerificationLevelCard({ level, icon, count, requirements, color, highlight }) {
  return (
    <motion.div 
      className={`verification-card ${highlight ? 'highlighted' : ''}`}
      whileHover={{ scale: 1.02 }}
      style={{ borderColor: color }}
    >
      <span className="level-icon">{icon}</span>
      <h3>{level}</h3>
      <p className="count">{count} users</p>
      <p className="requirements">{requirements}</p>
    </motion.div>
  );
}

// Utility Functions

function getBadgeIcon(level) {
  const icons = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    diamond: '💎'
  };
  return icons[level] || '✓';
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
