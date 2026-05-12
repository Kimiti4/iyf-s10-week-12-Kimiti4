/**
 * 🔹 Verification Badge Component - Unique to JamiiLink
 * Displays distinctive verification badges for users and organizations
 */
import './VerificationBadge.css';

const VerificationBadge = ({ 
  verification, 
  type = 'user',  // 'user' or 'organization'
  size = 'medium',  // 'small', 'medium', 'large'
  showLabel = true,
  showTooltip = true,
  className = ''
}) => {
  if (!verification || !verification.isVerified) {
    return null;
  }

  // Get badge configuration based on level and type
  const getBadgeStyle = () => {
    const level = verification.badgeLevel || (type === 'user' ? 'bronze' : 'verified');
    
    const configs = {
      // User badges
      bronze: {
        icon: '🥉',
        color: '#CD7F32',
        gradient: 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)',
        label: 'Verified Member'
      },
      silver: {
        icon: '🥈',
        color: '#C0C0C0',
        gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)',
        label: 'Trusted Member'
      },
      gold: {
        icon: '🥇',
        color: '#FFD700',
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        label: 'Gold Member'
      },
      platinum: {
        icon: '💎',
        color: '#E5E4E2',
        gradient: 'linear-gradient(135deg, #E5E4E2 0%, #B0E0E6 100%)',
        label: 'Platinum Member'
      },
      diamond: {
        icon: '👑',
        color: '#B9F2FF',
        gradient: 'linear-gradient(135deg, #B9F2FF 0%, #00BFFF 50%, #1E90FF 100%)',
        label: 'Diamond Member'
      },
      
      // Organization badges
      verified: {
        icon: '✓',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        label: 'Verified Organization'
      },
      premium: {
        icon: '⭐',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        label: 'Premium Partner'
      },
      partner: {
        icon: '🤝',
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        label: 'Strategic Partner'
      },
      official: {
        icon: '🏛️',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        label: 'Official Institution'
      }
    };
    
    return configs[level] || configs.bronze;
  };

  const badgeConfig = getBadgeStyle();
  
  // Size classes
  const sizeClasses = {
    small: 'badge-small',
    medium: 'badge-medium',
    large: 'badge-large'
  };

  return (
    <div 
      className={`verification-badge ${sizeClasses[size]} ${className}`}
      title={showTooltip ? badgeConfig.label : undefined}
      style={{
        background: verification.badgeGradient?.start 
          ? `linear-gradient(135deg, ${verification.badgeGradient.start} 0%, ${verification.badgeGradient.end || verification.badgeGradient.start} 100%)`
          : badgeConfig.gradient,
        boxShadow: `0 2px 8px ${badgeConfig.color}40`,
        border: `2px solid ${verification.badgeColor || badgeConfig.color}`
      }}
    >
      <span className="badge-icon">
        {verification.badgeIcon || badgeConfig.icon}
      </span>
      
      {showLabel && (
        <span className="badge-label">
          {badgeConfig.label}
        </span>
      )}
      
      {/* Animated glow effect */}
      <div 
        className="badge-glow"
        style={{
          background: `radial-gradient(circle, ${badgeConfig.color}60 0%, transparent 70%)`
        }}
      />
    </div>
  );
};

export default VerificationBadge;
