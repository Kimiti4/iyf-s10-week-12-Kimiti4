import { useState } from 'react';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaUsers,
  FaMapMarkerAlt,
  FaClock,
  FaThumbsUp,
  FaShare,
  FaFlag,
} from 'react-icons/fa';
import { useToast } from './Toast';
import './AlertCard.css';

const VERIFICATION_CONFIG = {
  unverified:          { label: 'Unverified',        icon: <FaExclamationTriangle />, className: 'badge--unverified' },
  community_verified:  { label: 'Community Verified', icon: <FaUsers />,              className: 'badge--community' },
  mod_verified:        { label: 'Moderator Verified', icon: <FaShieldAlt />,           className: 'badge--mod' },
  official:            { label: 'Official',           icon: <FaCheckCircle />,         className: 'badge--official' },
};

export default function AlertCard({ alert, onConfirm, currentUser }) {
  const toast = useToast();
  const [confirmed, setConfirmed] = useState(false);
  const [confirmationCount, setConfirmationCount] = useState(alert.confirmationCount || 0);

  const verification = VERIFICATION_CONFIG[alert.verificationLevel] || VERIFICATION_CONFIG.unverified;

  const handleConfirm = async () => {
    if (!currentUser) { toast.info('Login to confirm alerts'); return; }
    try {
      await onConfirm(alert.id);
      setConfirmed(!confirmed);
      setConfirmationCount(prev => confirmed ? prev - 1 : prev + 1);
    } catch { /* silent */ }
  };

  const formatDate = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <article className={`alert-card alert-card--${alert.severity}`} aria-label={`${alert.severity} alert: ${alert.title}`}>
      {/* Severity stripe */}
      <div className="alert-card__stripe" aria-hidden="true" />

      <div className="alert-card__body">
        {/* Header row */}
        <div className="alert-card__header">
          <div className="alert-card__badges">
            <span className={`alert-card__severity alert-card__severity--${alert.severity}`}>
              {alert.severity === 'critical' && '🔴'}
              {alert.severity === 'warning' && '🟠'}
              {alert.severity === 'info' && '🔵'}
              {' '}{alert.severity?.charAt(0).toUpperCase() + alert.severity?.slice(1)}
            </span>
            <span className={`alert-card__verification ${verification.className}`}>
              {verification.icon} {verification.label}
            </span>
          </div>
          <time className="alert-card__time" dateTime={alert.createdAt}>
            <FaClock aria-hidden="true" /> {formatDate(alert.createdAt)}
          </time>
        </div>

        {/* Content */}
        <h3 className="alert-card__title">{alert.title}</h3>
        <p className="alert-card__description">{alert.description}</p>

        {/* Location */}
        {alert.location?.address && (
          <div className="alert-card__location">
            <FaMapMarkerAlt aria-hidden="true" /> {alert.location.address}
          </div>
        )}

        {/* Tags */}
        {alert.tags?.length > 0 && (
          <div className="alert-card__tags">
            {alert.tags.map((tag, i) => (
              <span key={i} className="alert-card__tag">#{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="alert-card__footer">
          <div className="alert-card__stats">
            <span>{confirmationCount} confirmations</span>
            <span>·</span>
            <span>{alert.views || 0} views</span>
          </div>
          <div className="alert-card__actions">
            <button
              className={`alert-action-btn ${confirmed ? 'alert-action-btn--active' : ''}`}
              onClick={handleConfirm}
              aria-label={confirmed ? 'Unconfirm' : 'Confirm this alert'}
              aria-pressed={confirmed}
            >
              <FaThumbsUp aria-hidden="true" /> {confirmed ? 'Confirmed' : 'Confirm'}
            </button>
            <button className="alert-action-btn" aria-label="Share alert">
              <FaShare aria-hidden="true" /> Share
            </button>
            <button className="alert-action-btn" aria-label="Report alert">
              <FaFlag aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Author */}
        {alert.author && (
          <div className="alert-card__author">
            <div className="alert-card__avatar" aria-hidden="true">
              {alert.author.avatarIcon || alert.author.username?.charAt(0).toUpperCase()}
            </div>
            <span className="alert-card__author-name">{alert.author.username}</span>
            {verification.className !== 'badge--unverified' && (
              <span className="alert-card__verified">{verification.label}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
