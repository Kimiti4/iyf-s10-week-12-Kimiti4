/**
 * 🔹 Store Card Component
 * Displays verified store in marketplace with legitimacy indicators
 */

import { motion } from 'framer-motion';
import './StoreCard.css';

const StoreCard = ({ store }) => {
  const getVerificationColor = (level) => {
    const colors = {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      platinum: '#e5e4e2'
    };
    return colors[level] || colors.silver;
  };

  const getVerificationLabel = (level) => {
    const labels = {
      bronze: 'Bronze Verified',
      silver: 'Silver Verified',
      gold: 'Gold Verified',
      platinum: 'Platinum Verified'
    };
    return labels[level] || 'Verified';
  };

  return (
    <motion.div 
      className="store-card"
      whileHover={{ y: -5, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Store Banner */}
      <div className="store-banner">
        <img src={store.banner} alt={`${store.name} banner`} className="banner-image" />
        <div className="store-logo-container">
          <img src={store.logo} alt={store.name} className="store-logo" />
        </div>
      </div>

      {/* Store Info */}
      <div className="store-info">
        <div className="store-header">
          <h3 className="store-name">{store.name}</h3>
          {store.verified && (
            <div 
              className="verification-badge"
              style={{ borderColor: getVerificationColor(store.verificationLevel) }}
              title={`Verification Level: ${getVerificationLabel(store.verificationLevel)}`}
            >
              <span 
                className="badge-icon"
                style={{ color: getVerificationColor(store.verificationLevel) }}
              >
                ✓
              </span>
              <span className="badge-text">{getVerificationLabel(store.verificationLevel)}</span>
            </div>
          )}
        </div>

        <p className="store-description">{store.description}</p>

        {/* Category */}
        <div className="store-category">
          📂 {store.category}
        </div>

        {/* Stats */}
        <div className="store-stats">
          <div className="stat-item">
            <span className="stat-value">⭐ {store.rating}</span>
            <span className="stat-label">Rating</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{store.reviews}</span>
            <span className="stat-label">Reviews</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{store.products}</span>
            <span className="stat-label">Products</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{store.followers}</span>
            <span className="stat-label">Followers</span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="performance-metrics">
          <div className="metric">
            <span className="metric-label">Response Time:</span>
            <span className="metric-value">⚡ {store.responseTime}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Completion Rate:</span>
            <span className="metric-value success">{store.completionRate}%</span>
          </div>
        </div>

        {/* Badges */}
        {store.badges && store.badges.length > 0 && (
          <div className="store-badges">
            {store.badges.map((badge, index) => (
              <span key={index} className="achievement-badge">
                🏆 {badge}
              </span>
            ))}
          </div>
        )}

        {/* Location & Contact */}
        <div className="store-details">
          <div className="detail-item">
            <span className="detail-icon">📍</span>
            <span>{store.location}</span>
          </div>
          <div className="detail-item">
            <span className="detail-icon">📧</span>
            <span>{store.contact.email}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="store-actions">
          <button className="btn-primary visit-store-btn">
            Visit Store
          </button>
          <button className="btn-secondary follow-btn">
            Follow
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StoreCard;
