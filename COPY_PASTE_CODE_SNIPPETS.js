/**
 * 🚀 JamiiLink: Copy-Paste Ready Code Snippets
 * Phase 2: UI/UX Transformation
 * Ready to use - just copy to your files!
 */

// ============================================
// SNIPPET 1: Global CSS Theme (globals.css)
// ============================================
export const GLOBAL_CSS = `
:root {
  /* Primary Colors */
  --primary: #22C55E;
  --primary-light: #86EFAC;
  --primary-dark: #16A34A;
  
  /* Accent Colors */
  --accent: #F97316;
  --accent-light: #FDBA74;
  --accent-dark: #EA580C;
  
  /* Status Colors */
  --success: #22C55E;
  --warning: #FBBF24;
  --danger: #EF4444;
  --info: #3B82F6;
  
  /* Neutral */
  --neutral-50: #FAFAFA;
  --neutral-100: #F4F4F5;
  --neutral-200: #E4E4E7;
  --neutral-300: #D4D4D8;
  --neutral-400: #A1A1AA;
  --neutral-500: #71717A;
  --neutral-600: #52525B;
  --neutral-700: #3F3F46;
  --neutral-800: #27272A;
  --neutral-900: #18181B;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition: all 0.2s ease-in-out;
}

/* Global animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.spin { animation: spin 1s linear infinite; }
.pulse { animation: pulse 2s ease-in-out infinite; }

/* Button styles */
button {
  background: var(--primary);
  color: white;
  border: none;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  filter: brightness(1.1);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

/* Input styles */
input, textarea {
  border: 1px solid var(--neutral-200);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 8px;
  font-size: 16px;
  transition: var(--transition);
  font-family: inherit;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

/* Card styles */
.card {
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: 12px;
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--primary);
}

/* Badge styles */
.badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--primary);
  color: white;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}

.badge.outline {
  background: transparent;
  border: 1px solid var(--primary);
  color: var(--primary);
}

/* Avatar styles */
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  background: var(--neutral-100);
}

.avatar-lg {
  width: 120px;
  height: 120px;
}

/* Responsive typography */
h1 { font-size: 36px; font-weight: 700; line-height: 1.2; }
h2 { font-size: 28px; font-weight: 700; line-height: 1.3; }
h3 { font-size: 20px; font-weight: 600; line-height: 1.4; }
body { font-size: 16px; line-height: 1.5; color: var(--neutral-900); }

@media (max-width: 768px) {
  h1 { font-size: 28px; }
  h2 { font-size: 24px; }
  h3 { font-size: 18px; }
  body { font-size: 14px; }
}
`;

// ============================================
// SNIPPET 2: Updated Navbar Component
// ============================================
export const NAVBAR_COMPONENT = `
import React, { useState } from 'react';
import {
  HomeIcon, PostsIcon, SearchIcon,
  NotificationsIcon, ProfileIcon, LogoutIcon
} from './SVGIcons';
import { colors } from '../styles/designSystem';

export const Navbar = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <span style={{ fontSize: '24px', fontWeight: '700', color: colors.primary[600] }}>
            Jamii
          </span>
        </div>

        {/* Navigation Items */}
        <div className="navbar-items">
          <button
            className={\`nav-item \${activeTab === 'home' ? 'active' : ''}\`}
            onClick={() => setActiveTab('home')}
            title="Home"
          >
            <HomeIcon size={24} />
          </button>

          <button
            className={\`nav-item \${activeTab === 'posts' ? 'active' : ''}\`}
            onClick={() => setActiveTab('posts')}
            title="Posts"
          >
            <PostsIcon size={24} />
          </button>

          <button
            className="nav-item"
            title="Search"
          >
            <SearchIcon size={24} />
          </button>

          <button
            className={\`nav-item \${activeTab === 'alerts' ? 'active' : ''}\`}
            title="Alerts"
          >
            <NotificationsIcon size={24} />
            <span className="notification-badge">3</span>
          </button>
        </div>

        {/* User Menu */}
        <div className="navbar-user">
          <button
            className="nav-item"
            title={user?.name}
          >
            <ProfileIcon size={24} />
          </button>

          <button
            className="nav-item logout-btn"
            onClick={onLogout}
            title="Logout"
          >
            <LogoutIcon size={20} />
          </button>
        </div>
      </div>

      <style jsx>{\`
        .navbar {
          background: white;
          border-bottom: 1px solid var(--neutral-200);
          padding: 0 var(--spacing-lg);
          height: 64px;
          display: flex;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: var(--shadow-sm);
        }

        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .navbar-logo {
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
        }

        .navbar-items {
          display: flex;
          gap: var(--spacing-lg);
          flex: 1;
          justify-content: center;
        }

        .nav-item {
          background: none;
          border: none;
          color: var(--neutral-600);
          cursor: pointer;
          padding: var(--spacing-md);
          border-radius: 8px;
          transition: all 0.2s ease-in-out;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-item:hover {
          background: var(--neutral-100);
          color: var(--primary);
        }

        .nav-item.active {
          color: var(--primary);
          background: var(--primary-light);
        }

        .notification-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: var(--danger);
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
        }

        .navbar-user {
          display: flex;
          gap: var(--spacing-md);
          align-items: center;
        }

        .logout-btn {
          color: var(--danger);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 0 var(--spacing-md);
          }

          .navbar-items {
            gap: var(--spacing-md);
          }

          .nav-item {
            padding: var(--spacing-sm);
          }
        }
      \`}</style>
    </nav>
  );
};
`;

// ============================================
// SNIPPET 3: Post Card with New Icons
// ============================================
export const POST_CARD_COMPONENT = `
import React, { useState } from 'react';
import { LikeIcon, CommentIcon, ShareIcon, ConfirmIcon } from './SVGIcons';
import { Avatar } from './KenyanAvatarSystem';
import { colors } from '../styles/designSystem';

export const PostCard = ({ post, onLike, onComment, onShare, onConfirm }) => {
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    onLike && onLike(post.id);
  };

  return (
    <div className="post-card">
      {/* Header */}
      <div className="post-header">
        <Avatar
          userId={post.author.id}
          userName={post.author.name}
          tier={post.author.tier}
          size={40}
        />
        <div className="post-author">
          <h4>{post.author.name}</h4>
          <p className="post-time">{post.location} • {post.timeAgo}</p>
        </div>
      </div>

      {/* Content */}
      <div className="post-content">
        <h3>{post.title}</h3>
        <p>{post.description}</p>
      </div>

      {/* Status Badge */}
      {post.fulfilled && (
        <div className="post-badge">
          <ConfirmIcon size={16} /> Fulfilled
        </div>
      )}

      {/* Actions */}
      <div className="post-actions">
        <button
          className={\`action-btn \${liked ? 'liked' : ''}\`}
          onClick={handleLike}
        >
          <LikeIcon size={20} filled={liked} />
          <span>{post.likes + (liked ? 1 : 0)}</span>
        </button>

        <button className="action-btn" onClick={() => onComment && onComment(post.id)}>
          <CommentIcon size={20} />
          <span>{post.comments}</span>
        </button>

        <button className="action-btn" onClick={() => onShare && onShare(post.id)}>
          <ShareIcon size={20} />
        </button>

        {!post.fulfilled && (
          <button
            className="action-btn confirm-btn"
            onClick={() => onConfirm && onConfirm(post.id)}
          >
            <ConfirmIcon size={20} />
            <span>Mark Done</span>
          </button>
        )}
      </div>

      <style jsx>{\`
        .post-card {
          background: white;
          border: 1px solid var(--neutral-200);
          border-radius: 12px;
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
          transition: var(--transition);
        }

        .post-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--primary);
        }

        .post-header {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .post-author h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--neutral-900);
        }

        .post-time {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: var(--neutral-600);
        }

        .post-content h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: var(--neutral-900);
        }

        .post-content p {
          margin: 0 0 var(--spacing-md) 0;
          color: var(--neutral-700);
          line-height: 1.5;
        }

        .post-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--success);
          color: white;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: var(--spacing-md);
        }

        .post-actions {
          display: flex;
          gap: var(--spacing-md);
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--neutral-200);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: var(--neutral-600);
          cursor: pointer;
          font-size: 14px;
          padding: 4px 8px;
          border-radius: 6px;
          transition: var(--transition);
        }

        .action-btn:hover {
          background: var(--neutral-100);
          color: var(--primary);
        }

        .action-btn.liked {
          color: var(--danger);
        }

        .confirm-btn {
          margin-left: auto;
          background: var(--primary);
          color: white;
        }

        .confirm-btn:hover {
          background: var(--primary-dark);
        }

        @media (max-width: 768px) {
          .post-card {
            padding: var(--spacing-md);
          }

          .post-actions {
            flex-wrap: wrap;
          }

          .confirm-btn {
            margin-left: 0;
            flex: 1;
          }
        }
      \`}</style>
    </div>
  );
};
`;

// ============================================
// SNIPPET 4: Profile Page Integration
// ============================================
export const PROFILE_PAGE_SNIPPET = `
import React from 'react';
import { Avatar } from '../components/KenyanAvatarSystem';
import { BadgeIcon, SettingsIcon, LogoutIcon, SkillSwapIcon } from '../components/SVGIcons';
import { colors } from '../styles/designSystem';

export const ProfilePage = ({ user, onLogout, onFollowClick }) => {
  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <Avatar
          userId={user.id}
          userName={user.name}
          tier={user.tier}
          size={120}
        />

        <div className="profile-info">
          <h1>{user.name}</h1>
          <p className="location">{user.location}</p>

          {/* Badges */}
          <div className="badges-row">
            {user.badges?.map(badge => (
              <BadgeIcon key={badge} level={badge} size={24} />
            ))}
          </div>

          <p className="bio">{user.bio}</p>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-primary" onClick={() => onFollowClick(user.id)}>
              Follow
            </button>
            <button className="btn-outline">
              <SkillSwapIcon size={18} /> Request Skill Swap
            </button>
            <button className="btn-outline">
              <SettingsIcon size={18} /> Settings
            </button>
            <button className="btn-outline logout" onClick={onLogout}>
              <LogoutIcon size={18} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Impact Meter Section (Placeholder for Feature #1) */}
      <div className="impact-section">
        <h2>Your Community Impact</h2>
        <div className="impact-grid">
          <div className="impact-card">
            <p className="impact-label">People Helped</p>
            <p className="impact-value">{user.impact?.peopleHelped || 0}</p>
          </div>
          <div className="impact-card">
            <p className="impact-label">Value Shared</p>
            <p className="impact-value">{user.impact?.valueShared || 0} KES</p>
          </div>
          <div className="impact-card">
            <p className="impact-label">Skills Offered</p>
            <p className="impact-value">{user.skills?.length || 0}</p>
          </div>
          <div className="impact-card">
            <p className="impact-label">Impact Score</p>
            <p className="impact-value">{user.impact?.score || 0}</p>
          </div>
        </div>
      </div>

      <style jsx>{\`
        .profile-page {
          max-width: 800px;
          margin: 0 auto;
          padding: var(--spacing-lg);
        }

        .profile-header {
          display: flex;
          gap: var(--spacing-xl);
          margin-bottom: var(--spacing-xl);
          padding-bottom: var(--spacing-xl);
          border-bottom: 1px solid var(--neutral-200);
        }

        .profile-info {
          flex: 1;
        }

        .profile-info h1 {
          margin: 0 0 4px 0;
          font-size: 32px;
          color: var(--neutral-900);
        }

        .location {
          margin: 0 0 var(--spacing-md) 0;
          color: var(--neutral-600);
          font-size: 16px;
        }

        .badges-row {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .bio {
          margin: 0 0 var(--spacing-lg) 0;
          color: var(--neutral-700);
          line-height: 1.5;
        }

        .action-buttons {
          display: flex;
          gap: var(--spacing-md);
          flex-wrap: wrap;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
          padding: var(--spacing-sm) var(--spacing-lg);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: var(--transition);
        }

        .btn-primary:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
        }

        .btn-outline {
          background: white;
          color: var(--primary);
          border: 2px solid var(--primary);
          padding: var(--spacing-sm) var(--spacing-lg);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: var(--transition);
        }

        .btn-outline:hover {
          background: var(--primary-light);
          transform: translateY(-2px);
        }

        .btn-outline.logout {
          color: var(--danger);
          border-color: var(--danger);
        }

        .btn-outline.logout:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .impact-section {
          background: var(--neutral-50);
          padding: var(--spacing-lg);
          border-radius: 12px;
          margin-top: var(--spacing-xl);
        }

        .impact-section h2 {
          margin-top: 0;
          margin-bottom: var(--spacing-lg);
          color: var(--neutral-900);
        }

        .impact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--spacing-md);
        }

        .impact-card {
          background: white;
          padding: var(--spacing-md);
          border-radius: 8px;
          text-align: center;
          border: 1px solid var(--neutral-200);
        }

        .impact-label {
          margin: 0 0 8px 0;
          font-size: 12px;
          color: var(--neutral-600);
          font-weight: 600;
        }

        .impact-value {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: var(--primary);
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .action-buttons {
            width: 100%;
          }

          .btn-primary, .btn-outline {
            flex: 1;
            min-width: 120px;
          }

          .impact-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      \`}</style>
    </div>
  );
};
`;

// ============================================
// SNIPPET 5: Alert Card with New Icons
// ============================================
export const ALERT_CARD_SNIPPET = `
import {
  AlertIcon, EmergencyIcon, TrafficIcon, VerifiedIcon
} from './SVGIcons';

export const AlertCard = ({ alert, onConfirm }) => {
  const getIcon = () => {
    if (alert.priority === 'emergency') return <EmergencyIcon size={28} />;
    if (alert.priority === 'urgent') return <TrafficIcon size={28} />;
    return <AlertIcon size={28} />;
  };

  const getIconColor = () => {
    if (alert.priority === 'emergency') return '#EF4444';
    if (alert.priority === 'urgent') return '#FBBF24';
    return '#3B82F6';
  };

  return (
    <div className="alert-card" data-priority={alert.priority}>
      <div className="alert-content">
        <div className="alert-icon" style={{ color: getIconColor() }}>
          {getIcon()}
        </div>

        <div className="alert-info">
          <div className="alert-header">
            <h3>{alert.title}</h3>
            {alert.verified && (
              <VerifiedIcon size={18} style={{ color: '#F59E0B' }} />
            )}
          </div>
          <p className="alert-description">{alert.description}</p>
          <p className="alert-meta">
            {alert.location} • {alert.timeAgo}
          </p>
        </div>
      </div>

      {!alert.confirmed && (
        <button className="confirm-btn" onClick={() => onConfirm(alert.id)}>
          Confirm I Can Help
        </button>
      )}

      <style jsx>{\`
        .alert-card {
          background: white;
          border: 2px solid var(--neutral-200);
          border-left: 4px solid var(--primary);
          border-radius: 8px;
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-md);
          transition: var(--transition);
        }

        .alert-card[data-priority="emergency"] {
          border-left-color: #EF4444;
          background: rgba(239, 68, 68, 0.02);
        }

        .alert-card[data-priority="urgent"] {
          border-left-color: #FBBF24;
          background: rgba(251, 191, 36, 0.02);
        }

        .alert-card:hover {
          box-shadow: var(--shadow-md);
        }

        .alert-content {
          display: flex;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }

        .alert-icon {
          min-width: 40px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 2px;
        }

        .alert-info {
          flex: 1;
        }

        .alert-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .alert-header h3 {
          margin: 0;
          font-size: 18px;
          color: var(--neutral-900);
        }

        .alert-description {
          margin: 0 0 8px 0;
          color: var(--neutral-700);
          font-size: 14px;
          line-height: 1.5;
        }

        .alert-meta {
          margin: 0;
          color: var(--neutral-600);
          font-size: 12px;
        }

        .confirm-btn {
          width: 100%;
          background: var(--primary);
          color: white;
          border: none;
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: var(--transition);
        }

        .confirm-btn:hover {
          background: var(--primary-dark);
        }
      \`}</style>
    </div>
  );
};
`;

export default {
  GLOBAL_CSS,
  NAVBAR_COMPONENT,
  POST_CARD_COMPONENT,
  PROFILE_PAGE_SNIPPET,
  ALERT_CARD_SNIPPET,
};
