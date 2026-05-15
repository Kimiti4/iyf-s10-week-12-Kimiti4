import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './EmergencyAlerts.css';

/**
 * 🚨 Enhanced Emergency Alerts System
 * Real-time alerts from verified sources
 * Covers: blackouts, unrest, traffic, weather, accidents, amber alerts
 */

const ALERT_TYPES = [
  { type: 'blackout', icon: '⚡', label: 'Power Blackout', color: '#ef4444' },
  { type: 'unrest', icon: '🚨', label: 'Civil Unrest', color: '#dc2626' },
  { type: 'traffic', icon: '🚗', label: 'Traffic Jam', color: '#f59e0b' },
  { type: 'weather', icon: '🌧️', label: 'Bad Weather', color: '#3b82f6' },
  { type: 'accident', icon: '', label: 'Accident', color: '#ec4899' },
  { type: 'amber', icon: '👶', label: 'Amber Alert', color: '#f97316' },
  { type: 'health', icon: '🏥', label: 'Health Emergency', color: '#8b5cf6' },
  { type: 'infrastructure', icon: '', label: 'Infrastructure', color: '#6366f1' },
  { type: 'community', icon: '👥', label: 'Community Alert', color: '#14b8a6' }
];

const VERIFIED_SOURCES = [
  'KPLC Official',
  'NTSA Traffic Monitor',
  'Kenya Police Service',
  'Kenya Meteorological Dept',
  'Red Cross Kenya',
  'DCI Kenya',
  'NCWSC Official',
  'Community Leaders',
  'National Disaster Management'
];

export default function EnhancedEmergencyAlerts({ currentUser }) {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [selectedType, setSelectedType] = useState('blackout');
  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    location: '',
    source: ''
  });

  // Simulate real-time alerts
  useEffect(() => {
    loadAlerts();
    const interval = setInterval(() => {
      // Auto-refresh every 5 minutes
      loadAlerts();
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = () => {
    const realTimeAlerts = [
      {
        id: 1,
        type: 'blackout',
        title: '⚡ Power Blackout - Westlands',
        message: 'Complete power outage affecting Westlands, Parklands, and surrounding areas. KPLC restoration teams dispatched. Expected resolution: 2-3 hours.',
        location: 'Westlands, Nairobi',
        timestamp: new Date(Date.now() - 1800000),
        severity: 'critical',
        verified: true,
        source: 'KPLC Official'
      },
      {
        id: 2,
        type: 'traffic',
        title: ' Severe Traffic Jam - Thika Road',
        message: 'Major traffic congestion on Thika Road near Kenyatta Hospital. Multiple accidents causing delays. Alternative route via Mombasa Road recommended.',
        location: 'Thika Road, Nairobi',
        timestamp: new Date(Date.now() - 3600000),
        severity: 'warning',
        verified: true,
        source: 'NTSA Traffic Monitor'
      },
      {
        id: 3,
        type: 'unrest',
        title: '🚨 Civil Unrest - CBD Area',
        message: 'Demonstrations reported in Nairobi CBD near Parliament Buildings. Heavy police presence. Avoid area until further notice. Roads closed: Moi Avenue, Kenyatta Avenue.',
        location: 'Nairobi CBD',
        timestamp: new Date(Date.now() - 5400000),
        severity: 'critical',
        verified: true,
        source: 'Kenya Police Service'
      },
      {
        id: 4,
        type: 'weather',
        title: '🌧️ Heavy Rain Warning - Kiambu',
        message: 'KMD issues warning for heavy rainfall in Kiambu County. Flood-prone areas at risk. Residents advised to stay indoors and prepare emergency supplies.',
        location: 'Kiambu County',
        timestamp: new Date(Date.now() - 7200000),
        severity: 'warning',
        verified: true,
        source: 'Kenya Meteorological Dept'
      },
      {
        id: 5,
        type: 'accident',
        title: '🚑 Major Accident - Mombasa Road',
        message: 'Multi-vehicle collision near JKIA roundabout. Ambulances on scene. Expect major delays. Emergency lanes clear for response vehicles.',
        location: 'Mombasa Road, JKIA',
        timestamp: new Date(Date.now() - 900000),
        severity: 'critical',
        verified: true,
        source: 'Red Cross Kenya'
      },
      {
        id: 6,
        type: 'amber',
        title: '👶 AMBER Alert - Missing Child',
        message: 'Child, age 6, last seen near Uhuru Park. Wearing red jacket and blue jeans. Please report any sightings to police immediately. Hotline: 999.',
        location: 'Uhuru Park, Nairobi',
        timestamp: new Date(Date.now() - 1200000),
        severity: 'critical',
        verified: true,
        source: 'DCI Kenya'
      },
      {
        id: 7,
        type: 'infrastructure',
        title: '🔧 Water Supply Interruption',
        message: 'Planned maintenance causing water supply interruption in Kileleshwa and Hurlingham. Restoration expected by 6 PM. NCWSC advises storage of water.',
        location: 'Kileleshwa, Nairobi',
        timestamp: new Date(Date.now() - 10800000),
        severity: 'info',
        verified: true,
        source: 'NCWSC Official'
      },
      {
        id: 8,
        type: 'community',
        title: ' Community Safety Meeting',
        message: 'Emergency community safety meeting at Kibera Social Hall. All residents invited. Discussion on recent security issues and prevention measures.',
        location: 'Kibera, Nairobi',
        timestamp: new Date(Date.now() - 14400000),
        severity: 'info',
        verified: true,
        source: 'Community Leaders'
      }
    ];
    setAlerts(realTimeAlerts);
  };

  const handleCreateAlert = () => {
    const alert = {
      id: Date.now(),
      type: selectedType,
      title: `${ALERT_TYPES.find(t => t.type === selectedType)?.icon || ''} ${newAlert.title}`,
      message: newAlert.message,
      location: newAlert.location,
      timestamp: new Date(),
      severity: selectedType === 'amber' || selectedType === 'unrest' ? 'critical' : 'warning',
      verified: currentUser?.role === 'founder',
      source: newAlert.source || 'Community Report'
    };
    setAlerts([alert, ...alerts]);
    setShowCreateAlert(false);
    setNewAlert({ title: '', message: '', location: '', source: '' });
  };

  const filteredAlerts = useMemo(() => 
    filter === 'all' 
      ? alerts 
      : alerts.filter(alert => alert.type === filter),
    [alerts, filter]
  );

  const verifiedAlerts = useMemo(() => 
    alerts.filter(a => a.verified).length,
    [alerts]
  );
  
  const criticalAlerts = useMemo(() => 
    alerts.filter(a => a.severity === 'critical').length,
    [alerts]
  );

  return (
    <div className="emergency-alerts">
      {/* Header Stats */}
      <div className="alerts-header">
        <div className="header-left">
          <h2> Emergency Alerts</h2>
          <div className="alert-stats">
            <span className="stat-badge verified">✅ {verifiedAlerts} Verified</span>
            <span className="stat-badge critical">️ {criticalAlerts} Critical</span>
          </div>
        </div>
        <div className="header-right">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            {ALERT_TYPES.map(type => (
              <button
                key={type.type}
                className={`filter-tab ${filter === type.type ? 'active' : ''}`}
                onClick={() => setFilter(type.type)}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>
          {currentUser?.role === 'founder' && (
            <motion.button
              className="create-alert-btn"
              onClick={() => setShowCreateAlert(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              + Create Alert
            </motion.button>
          )}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="alerts-list">
        <AnimatePresence>
          {filteredAlerts.map((alert) => {
            const alertType = ALERT_TYPES.find(t => t.type === alert.type);
            return (
              <motion.div
                key={alert.id}
                className={`alert-card ${alert.severity}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="alert-card-header">
                  <div className="alert-type-info">
                    <span className="alert-type-icon" style={{ color: alertType?.color }}>
                      {alertType?.icon || '⚠️'}
                    </span>
                    <h3>{alert.title}</h3>
                  </div>
                  <div className="alert-badges">
                    {alert.verified && (
                      <span className="verified-badge" role="status" aria-label="Verified source">✓ Verified</span>
                    )}
                    <span className={`severity-badge ${alert.severity}`} role="status" aria-label={`${alert.severity} severity level`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <p className="alert-message">{alert.message}</p>
                
                <div className="alert-card-footer">
                  <div className="alert-meta">
                    <span className="alert-location"> {alert.location}</span>
                    <span className="alert-source">📢 {alert.source}</span>
                    <span className="alert-time">{formatTime(alert.timestamp)}</span>
                  </div>
                  <div className="alert-actions">
                    <button className="btn-share-alert" title="Share Alert" aria-label="Share this alert">🔗 Share</button>
                    <button className="btn-report-alert" title="Report" aria-label="Report this alert">🚩 Report</button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Create Alert Modal */}
      <AnimatePresence>
        {showCreateAlert && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateAlert(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Create Emergency Alert</h3>
                <button className="btn-close" onClick={() => setShowCreateAlert(false)}>✕</button>
              </div>
              
              <div className="form-group">
                <label>Alert Type</label>
                <div className="type-selector">
                  {ALERT_TYPES.map(type => (
                    <div
                      key={type.type}
                      className={`type-option ${selectedType === type.type ? 'selected' : ''}`}
                      onClick={() => setSelectedType(type.type)}
                    >
                      <span className="icon">{type.icon}</span>
                      <span className="label">{type.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({...newAlert, title: e.target.value})}
                  placeholder="Alert title"
                />
              </div>
              
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
                  placeholder="Detailed alert message"
                  rows={4}
                />
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={newAlert.location}
                  onChange={(e) => setNewAlert({...newAlert, location: e.target.value})}
                  placeholder="Affected area"
                />
              </div>
              
              <div className="form-group">
                <label>Source</label>
                <select
                  value={newAlert.source}
                  onChange={(e) => setNewAlert({...newAlert, source: e.target.value})}
                >
                  <option value="">Select verified source</option>
                  {VERIFIED_SOURCES.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              
              <motion.button
                className="btn-submit"
                onClick={handleCreateAlert}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Publish Alert
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency Contacts */}
      <div className="emergency-contacts">
        <h3>📞 Emergency Contacts</h3>
        <div className="contacts-grid">
          <a href="tel:999" className="contact-card">
            <span className="contact-icon">🚨</span>
            <div className="contact-info">
              <strong>Emergency Services</strong>
              <span className="phone">999</span>
            </div>
          </a>
          <a href="tel:1199" className="contact-card">
            <span className="contact-icon">🆘</span>
            <div className="contact-info">
              <strong>Suicide Prevention</strong>
              <span className="phone">1199</span>
            </div>
          </a>
          <a href="tel:911" className="contact-card">
            <span className="contact-icon"></span>
            <div className="contact-info">
              <strong>Police</strong>
              <span className="phone">911</span>
            </div>
          </a>
          <a href="tel:112" className="contact-card">
            <span className="contact-icon">🚑</span>
            <div className="contact-info">
              <strong>Ambulance</strong>
              <span className="phone">112</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

function formatTime(timestamp) {
  const now = new Date();
  const diff = now - new Date(timestamp);
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}
