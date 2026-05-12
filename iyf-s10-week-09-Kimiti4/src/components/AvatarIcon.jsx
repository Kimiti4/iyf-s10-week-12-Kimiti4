/**
 * 🔹 Avatar Icon Component - Fun Icons for Blank Profiles
 * Displays emoji icons with styled backgrounds for users without avatars
 */
import './AvatarIcon.css';

const AvatarIcon = ({ 
  user, 
  size = 'medium',
  showName = false,
  className = ''
}) => {
  if (!user) return null;
  
  // Use custom avatar if available
  if (user.profile?.avatar) {
    return (
      <div className={`avatar-container ${className}`}>
        <img 
          src={user.profile.avatar} 
          alt={user.username}
          className={`avatar-image avatar-${size}`}
        />
      </div>
    );
  }
  
  // Get icon from profile or generate one
  const icon = user.profile?.avatarIcon || getIconForUser(user._id, user.username);
  const style = getIconStyle(icon);
  
  return (
    <div className={`avatar-container ${className}`}>
      <div 
        className={`avatar-icon avatar-${size}`}
        style={{
          backgroundColor: style.backgroundColor,
          color: style.textColor
        }}
      >
        {icon}
      </div>
      {showName && (
        <span className="avatar-name">{user.username}</span>
      )}
    </div>
  );
};

// Helper: Get deterministic icon for user
function getIconForUser(userId, username) {
  const seed = userId || username || 'default';
  const hash = simpleHash(seed);
  
  const icons = [
    '🦁', '🐘', '🦒', '🦓', '🐃', '🦏', '🐆', '🐪',
    '🌍', '🌟', '🔥', '💎', '🚀', '⚡', '🌈', '🎯',
    '🎨', '🎭', '🎪', '🎬', '🎸', '🎺', '🎻', '🎲',
    '👑', '🛡️', '⚔️', '🏆', '🎖️', '🌺', '🌸', '🍀'
  ];
  
  const index = Math.abs(hash) % icons.length;
  return icons[index];
}

// Helper: Simple hash function
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// Helper: Get icon styling
function getIconStyle(icon) {
  const colorMap = {
    '🦁': '#FFA500', '🐘': '#808080', '🦒': '#FFD700',
    '🌍': '#4169E1', '🌟': '#FFD700', '🔥': '#FF4500',
    '🎨': '#FF69B4', '🎭': '#9370DB', '🎸': '#8B4513',
    '👑': '#FFD700', '🏆': '#FFD700', '💎': '#00CED1',
    '🌺': '#FF69B4', '🌸': '#FFB6C1', '🍀': '#228B22'
  };
  
  return {
    backgroundColor: colorMap[icon] || '#6B7280',
    textColor: '#FFFFFF'
  };
}

export default AvatarIcon;
