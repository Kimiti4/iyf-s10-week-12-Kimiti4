/**
 * 🔹 Alert Card Component
 * Displays individual alerts with verification badges and actions
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaShieldAlt, 
  FaUsers,
  FaMapMarkerAlt,
  FaClock,
  FaThumbsUp,
  FaShare,
  FaFlag
} from 'react-icons/fa';
import './AlertCard.css';

// Verification level configurations
const VERIFICATION_CONFIG = {
  unverified: {
    label: 'Unverified',
    icon: <FaExclamationTriangle />,
    color: '#9ca3af',
    bgColor: '#f3f4f6'
  },
  community_verified: {
    label: 'Community Verified',
    icon: <FaUsers />,
    color: '#10b981',
    bgColor: '#d1fae5'
  },
  mod_verified: {
    label: 'Moderator Verified',
    icon: <FaShieldAlt />,
    color: '#3b82f6',
    bgColor: '#dbeafe'
  },
  official: {
    label: 'Official',
    icon: <FaCheckCircle />,
    color: '#8b5cf6',
    bgColor: '#ede9fe'
  }
};

// Severity configurations
const SEVERITY_CONFIG = {
  info: { color: '#3b82f6', label: 'Info' },
  warning: { color: '#f59e0b', label: 'Warning' },
  critical: { color: '#ef4444', label: 'Critical' },
  official: { color: '#8b5cf6', label: 'Official' }
};

export default function AlertCard({ alert, onConfirm, currentUser }) {
  const [confirmed, setConfirmed] = useState(
    alert.confirmations?.some(c => c.user === currentUser?._id) || false
  );
  const [confirmationCount, setConfirmationCount] = useState(alert.confirmationCount || 0);

  const verificationInfo = VERIFICATION_CONFIG[alert.verificationLevel] || VERIFICATION_CONFIG.unverified;
  const severityInfo = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info;

  const handleConfirm = async () => {
    if (!currentUser) {
      alert('Please login to confirm alerts');
      return;
    }

    try {
      await onConfirm(alert._id);
      setConfirmed(!confirmed);
      setConfirmationCount(prev => confirmed ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Failed to confirm alert:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <motion.article
      className={`alert-card severity-${alert.severity}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with verification badge */}
      <div className="alert-header">
        <div className="alert-meta">
          <span 
            className="verification-badge"
            style={{ 
              background: verificationInfo.bgColor,
              color: verificationInfo.color
            }}
          >
            {verificationInfo.icon}
            <span>{verificationInfo.label}</span>
          </span>
          
          <span 
            className="severity-badge"
            style={{ 
              background: `${severityInfo.color}20`,
              color: severityInfo.color
            }}
          >
            {severityInfo.label}
          </span>
        </div>
        
        <div className="alert-timestamp">
          <FaClock />
          <span>{formatDate(alert.createdAt)}</span>
        </div>
      </div>

      {/* Alert content */}
      <div className="alert-content">
        <h3 className="alert-title">{alert.title}</h3>
        <p className="alert-description">{alert.description}</p>
      </div>

      {/* Location (if available) */}
      {alert.location?.address && (
        <div className="alert-location">
          <FaMapMarkerAlt />
          <span>{alert.location.address}</span>
        </div>
      )}

      {/* Tags */}
      {alert.tags && alert.tags.length > 0 && (
        <div className="alert-tags">
          {alert.tags.map((tag, index) => (
            <span key={index} className="alert-tag">#{tag}</span>
          ))}
        </div>
      )}

      {/* Footer with actions */}
      <div className="alert-footer">
        <div className="alert-stats">
          <div className="stat-item">
            <FaThumbsUp />
            <span>{confirmationCount} confirmations</span>
          </div>
          <div className="stat-item">
            <span>{alert.views || 0} views</span>
          </div>
        </div>

        <div className="alert-actions">
          <button
            className={`action-btn confirm-btn ${confirmed ? 'confirmed' : ''}`}
            onClick={handleConfirm}
            disabled={!currentUser}
          >
            <FaThumbsUp />
            <span>{confirmed ? 'Confirmed' : 'Confirm'}</span>
          </button>
          
          <button className="action-btn share-btn">
            <FaShare />
            <span>Share</span>
          </button>
          
          <button className="action-btn report-btn">
            <FaFlag />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* Author info */}
      {alert.author && (
        <div className="alert-author">
          <div className="author-avatar">
            {alert.author.avatar || alert.author.username?.charAt(0).toUpperCase()}
          </div>
          <div className="author-info">
            <span className="author-name">{alert.author.username}</span>
            {alert.author.profile?.verified && (
              <span className="author-verified">✓ Verified</span>
            )}
          </div>
        </div>
      )}
    </motion.article>
  );
}
