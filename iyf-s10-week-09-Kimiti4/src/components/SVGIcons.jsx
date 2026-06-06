/**
 * 🎨 SVG Icon Library - Replace all emojis
 * Whimsical, clean, and consistent design
 */

import React from 'react';

// Icon wrapper for consistency
const Icon = ({ children, size = 24, color = 'currentColor', className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {children}
  </svg>
);

// ============================================
// ALERTS & NOTIFICATIONS ICONS
// ============================================

export const AlertIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </Icon>
);

export const EmergencyIcon = ({ size = 24, ...props }) => (
  <Icon size={size} color="#EF4444" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#EF4444" />
    <line x1="12" y1="7" x2="12" y2="13" stroke="white" strokeWidth="2" />
    <circle cx="12" cy="16" r="1" fill="white" />
  </Icon>
);

export const TrafficIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
    <line x1="12" y1="7" x2="12" y2="10" />
    <line x1="12" y1="14" x2="12" y2="17" />
  </Icon>
);

export const VerifiedIcon = ({ size = 24, ...props }) => (
  <Icon size={size} color="#F59E0B" {...props}>
    <path d="M22 11.08V12c0 5.52-4.48 10-10 10S2 17.52 2 12s4.48-10 10-10h.92" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </Icon>
);

// ============================================
// COMMUNITY & SOCIAL ICONS
// ============================================

export const CommunityIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <circle cx="9" cy="9" r="3" />
    <circle cx="18" cy="9" r="3" />
    <circle cx="13.5" cy="16" r="3" />
    <path d="M9 12.5c2.5 1.5 2.5 3 0 4" />
    <path d="M18 12.5c-2.5 1.5-2.5 3 0 4" />
  </Icon>
);

export const ReputableIcon = ({ size = 24, ...props }) => (
  <Icon size={size} color="#8B5CF6" {...props}>
    <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="#8B5CF6" />
  </Icon>
);

export const SkillSwapIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <path d="M8 12L12 16L16 12" />
    <path d="M16 12L12 8L8 12" />
    <circle cx="12" cy="12" r="9" />
  </Icon>
);

// ============================================
// MARKETPLACE & COMMERCE ICONS
// ============================================

export const MarketplaceIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <circle cx="9" cy="9" r="2" />
    <path d="M2 12h4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2h4" />
    <rect x="3" y="14" width="18" height="6" rx="1" />
  </Icon>
);

export const FarmIcon = ({ size = 24, ...props }) => (
  <Icon size={size} color="#10B981" {...props}>
    <path d="M12 2C6 4 2 7 2 12c0 5 4 8 10 8s10-3 10-8c0-5-4-8-10-10z" />
    <circle cx="8" cy="10" r="1.5" fill="#10B981" />
    <circle cx="16" cy="10" r="1.5" fill="#10B981" />
    <path d="M12 15c-1.5-1-3-1-3-1s1.5 1 3 1s3-1 3-1" />
  </Icon>
);

export const PriceIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Icon>
);

// ============================================
// NAVIGATION ICONS
// ============================================

export const HomeIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </Icon>
);

export const PostsIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </Icon>
);

export const SearchIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);

export const NotificationsIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Icon>
);

export const ProfileIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

// ============================================
// ACTION ICONS
// ============================================

export const LikeIcon = ({ size = 24, filled = false, ...props }) => (
  <Icon size={size} {...props}>
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      fill={filled ? '#EF4444' : 'none'}
      stroke={filled ? '#EF4444' : 'currentColor'}
    />
  </Icon>
);

export const CommentIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Icon>
);

export const ShareIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </Icon>
);

export const ConfirmIcon = ({ size = 24, ...props }) => (
  <Icon size={size} color="#22C55E" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </Icon>
);

// ============================================
// PROFILE & USER ICONS
// ============================================

export const BadgeIcon = ({ size = 24, level = 'bronze', ...props }) => {
  const colors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    diamond: '#B9F2FF',
  };

  return (
    <Icon size={size} {...props}>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={colors[level]}
        stroke={colors[level]}
      />
    </Icon>
  );
};

export const SettingsIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v4M4.22 4.22l4.24 4.24m3.08 3.08l4.24 4.24M1 12h6m6 0h4m-16.78 7.78l4.24-4.24m3.08-3.08l4.24-4.24" />
  </Icon>
);

export const LogoutIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4" />
    <polyline points="17 16 21 12 17 8" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Icon>
);

// ============================================
// EMPTY STATE & STATUS ICONS
// ============================================

export const EmptyIcon = ({ size = 48, ...props }) => (
  <Icon size={size} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="12" y1="8" x2="12" y2="16" />
  </Icon>
);

export const LoadingIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <circle cx="12" cy="12" r="10" opacity="0.3" />
    <circle cx="12" cy="12" r="10" opacity="0" style={{ animation: 'spin 1s linear infinite' }} />
  </Icon>
);

// ============================================
// NOVEL FEATURE ICONS
// ============================================

export const ImpactMeterIcon = ({ size = 24, ...props }) => (
  <Icon size={size} color="#F97316" {...props}>
    <rect x="3" y="12" width="18" height="9" rx="1" />
    <rect x="3" y="12" width="13.5" height="9" rx="1" fill="#F97316" opacity="0.6" />
    <line x1="3" y1="15" x2="21" y2="15" strokeDasharray="2" />
  </Icon>
);

export const MatchmakingIcon = ({ size = 24, ...props }) => (
  <Icon size={size} color="#8B5CF6" {...props}>
    <circle cx="8" cy="8" r="3" stroke="#8B5CF6" />
    <circle cx="16" cy="8" r="3" stroke="#8B5CF6" />
    <path d="M8 11c2 2 6 2 8 0" stroke="#8B5CF6" fill="none" />
    <line x1="8" y1="11" x2="8" y2="20" stroke="#8B5CF6" />
    <line x1="16" y1="11" x2="16" y2="20" stroke="#8B5CF6" />
  </Icon>
);

export const MapViewIcon = ({ size = 24, ...props }) => (
  <Icon size={size} {...props}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

export const ChallengeIcon = ({ size = 24, ...props }) => (
  <Icon size={size} color="#FBBF24" {...props}>
    <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </Icon>
);

export default {
  // Alerts
  AlertIcon,
  EmergencyIcon,
  TrafficIcon,
  VerifiedIcon,

  // Community
  CommunityIcon,
  ReputableIcon,
  SkillSwapIcon,

  // Marketplace
  MarketplaceIcon,
  FarmIcon,
  PriceIcon,

  // Navigation
  HomeIcon,
  PostsIcon,
  SearchIcon,
  NotificationsIcon,
  ProfileIcon,

  // Actions
  LikeIcon,
  CommentIcon,
  ShareIcon,
  ConfirmIcon,

  // Profile
  BadgeIcon,
  SettingsIcon,
  LogoutIcon,

  // Empty States
  EmptyIcon,
  LoadingIcon,

  // Novel Features
  ImpactMeterIcon,
  MatchmakingIcon,
  MapViewIcon,
  ChallengeIcon,
};
