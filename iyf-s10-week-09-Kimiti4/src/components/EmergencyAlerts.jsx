import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './EmergencyAlerts.css';

/**
 *  Emergency Alerts System
 * Real-time emergency notifications for communities
 */

const ALERT_TYPES = [
  { type: 'security', icon: '', label: 'Security Alert', color: '#ef4444' },
  { type: 'weather', icon: '', label: 'Weather Warning', color: '#f59e0b' },
  { type: 'health', icon: '', label: 'Health Emergency', color: '#ec4899' },
  { type: 'infrastructure', icon: '', label: 'Infrastructure Issue', color: '#3b82f6' },
  { type: 'community', icon: '', label: 'Community Alert', color: '#8b5cf6' }
];

export default function EmergencyAlerts({ currentUser }) {
  const [alerts, setAlerts] = useState([]);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  // Sample alerts (replace with real API)
  const sampleAlerts = [
    {
      id: 1,
      type: 'security',
      title: 'Area Security Alert',
      message: 'Increased police presence in CBD. Avoid unnecessary travel.',
      location: 'Nairobi CBD',
      timestamp: new Date(Date.now() - 3600000),
      severity: 'medium'
    },
    {
      id: 2,
      type: 'weather',
      title: 'Heavy Rain Warning',
      message: 'Expected heavy rainfall in next 6 hours. Prepare accordingly.',
      location: 'Westlands',
      timestamp: new Date(Date.now() - 7200000),
      severity: 'high'
    }
  ];

  return (
    <div className="emergency-alerts">
      {/* Header */}
      <div className="alerts-header">
        <h2>🚨 Emergency Alerts</h2>
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

      {/* Active Alerts */}
      <div className="alerts-list">
        {(alerts.length > 0 ? alerts : sampleAlerts).map((alert) => (
          <motion.div
            key={alert.id}
            className={`alert-card ${alert.severity}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="alert-icon">
              {ALERT_TYPES.find(t => t.type === alert.type)?.icon || ''}
            </div>
            <div className="alert-content">
              <div className="alert-header">
                <h3>{alert.title}</h3>
                <span className={`severity-badge ${alert.severity}`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
              <p>{alert.message}</p>
              <div className="alert-footer">
                <span className="location">📍 {alert.location}</span>
                <span className="time">{formatTime(alert.timestamp)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Emergency Contacts</h3>
        <div className="contacts-grid">
          <a href="tel:999" className="contact-card">
            <span className="contact-icon"></span>
            <div className="contact-info">
              <strong>Emergency Services</strong>
              <span>999</span>
            </div>
          </a>
          <a href="tel:1199" className="contact-card">
            <span className="contact-icon"></span>
            <div className="contact-info">
              <strong>Suicide Prevention</strong>
              <span>1199</span>
            </div>
          </a>
          <a href="tel:911" className="contact-card">
            <span className="contact-icon"></span>
            <div className="contact-info">
              <strong>Police</strong>
              <span>911</span>
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
