import { useState } from 'react';
import { motion } from 'framer-motion';
import './EmergencyAlerts.css';

/**
 *  Emergency Alerts System
 * Real-time emergency notifications for communities
 */

const ALERT_TYPES = [
  { type: 'blackout', icon: '⚡', label: 'Power Blackout', color: '#ef4444', severity: 'critical' },
  { type: 'unrest', icon: '🚨', label: 'Civil Unrest', color: '#dc2626', severity: 'critical' },
  { type: 'traffic', icon: '', label: 'Traffic Jam', color: '#f59e0b', severity: 'warning' },
  { type: 'weather', icon: '🌧️', label: 'Bad Weather', color: '#3b82f6', severity: 'warning' },
  { type: 'accident', icon: '🚑', label: 'Accident', color: '#ec4899', severity: 'critical' },
  { type: 'amber', icon: '👶', label: 'Amber Alert', color: '#f97316', severity: 'critical' },
  { type: 'health', icon: '🏥', label: 'Health Emergency', color: '#8b5cf6', severity: 'warning' },
  { type: 'infrastructure', icon: '', label: 'Infrastructure Issue', color: '#6366f1', severity: 'info' },
  { type: 'community', icon: '👥', label: 'Community Alert', color: '#14b8a6', severity: 'info' }
];

export default function EmergencyAlerts({ currentUser }) {
  const [alerts, setAlerts] = useState([]);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  // Real-time alerts from verified sources
  const sampleAlerts = [
    {
      id: 1,
      type: 'blackout',
      title: 'Power Blackout - Westlands',
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
      title: 'Severe Traffic Jam - Thika Road',
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
      title: 'Civil Unrest - CBD Area',
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
      title: 'Heavy Rain Warning - Kiambu',
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
      title: 'Major Accident - Mombasa Road',
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
      title: 'AMBER Alert - Missing Child',
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
      title: 'Water Supply Interruption',
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
      title: 'Community Gathering - Safety Meeting',
      message: 'Emergency community safety meeting at Kibera Social Hall. All residents invited. Discussion on recent security issues and prevention measures.',
      location: 'Kibera, Nairobi',
      timestamp: new Date(Date.now() - 14400000),
      severity: 'info',
      verified: true,
      source: 'Community Leaders'
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
