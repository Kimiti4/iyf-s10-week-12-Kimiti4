/**
 * 🎨 JamiiLink Profile Avatar System
 * Novel, whimsical profile placeholders inspired by Kenyan community
 */

import React, { useMemo } from 'react';
import { colors } from '../styles/designSystem';

/**
 * Novel Profile Avatar with unique geometric Kenyan-inspired design
 * Features:
 * - Geometric patterns reflecting Maasai/Kenyan aesthetics
 * - Color-coded by community tier (local, skilled, verified, official)
 * - Deterministic based on user ID (consistent across sessions)
 * - Whimsical and fun while professional
 */

const KenyanPatternAvatar = ({ userId, userName = '', tier = 'local', size = 64 }) => {
  // Determine colors based on tier
  const tierColors = {
    local: { primary: colors.community.local, secondary: colors.primary[300] },
    skilled: { primary: colors.community.skilled, secondary: colors.primary[300] },
    verified: { primary: colors.community.verified, secondary: colors.primary[500] },
    official: { primary: colors.community.official, secondary: colors.primary[500] },
  };

  const tierColor = tierColors[tier] || tierColors.local;

  // Generate deterministic pattern from userId
  const seed = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }, [userId]);

  // Generate pattern variations
  const patternType = seed % 5;
  const rotation = (seed >> 8) % 360;
  const scale = 0.8 + ((seed >> 16) % 10) / 50;

  // Initials from username
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <svg width={size} height={size} viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle */}
      <defs>
        <linearGradient id={`grad-${userId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={tierColor.primary} />
          <stop offset="100%" stopColor={tierColor.secondary} />
        </linearGradient>

        <pattern id={`pattern-${userId}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          {patternType === 0 && (
            <>
              <rect x="0" y="0" width="10" height="10" fill="currentColor" opacity="0.1" />
              <rect x="10" y="10" width="10" height="10" fill="currentColor" opacity="0.1" />
            </>
          )}
          {patternType === 1 && (
            <circle cx="10" cy="10" r="5" fill="currentColor" opacity="0.15" />
          )}
          {patternType === 2 && (
            <>
              <line x1="0" y1="0" x2="20" y2="20" stroke="currentColor" strokeWidth="2" opacity="0.1" />
            </>
          )}
          {patternType === 3 && (
            <>
              <path
                d="M 10 0 L 20 10 L 10 20 L 0 10 Z"
                fill="currentColor"
                opacity="0.1"
              />
            </>
          )}
          {patternType === 4 && (
            <>
              <path
                d="M 10 0 Q 15 10 10 20 Q 5 10 10 0"
                fill="currentColor"
                opacity="0.1"
              />
            </>
          )}
        </pattern>
      </defs>

      {/* Base circle with gradient */}
      <circle cx="64" cy="64" r="64" fill={`url(#grad-${userId})`} />

      {/* Subtle geometric pattern overlay */}
      <circle cx="64" cy="64" r="60" fill={`url(#pattern-${userId})`} color={tierColor.primary} />

      {/* Geometric shapes (Kenyan-inspired) */}
      <g opacity="0.2" transform={`rotate(${rotation} 64 64)`}>
        {/* Maasai shield-inspired shape */}
        <path
          d="M 64 20 L 95 50 L 95 95 Q 64 110 33 95 L 33 50 Z"
          fill="white"
          stroke="white"
          strokeWidth="2"
        />
        {/* Geometric lines */}
        <line x1="64" y1="30" x2="64" y2="100" stroke="white" strokeWidth="1" />
        <line x1="40" y1="60" x2="88" y2="60" stroke="white" strokeWidth="1" />
      </g>

      {/* Initials text in center */}
      <text
        x="64"
        y="74"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.35}
        fontWeight="700"
        fill="white"
        fontFamily="'Inter var', sans-serif"
        letterSpacing="2"
      >
        {initials || '🌍'}
      </text>

      {/* Tier badge (small circle in corner) */}
      {tier !== 'local' && (
        <circle
          cx={size - 12}
          cy={size - 12}
          r="8"
          fill={tierColor.primary}
          stroke="white"
          strokeWidth="1.5"
        />
      )}
      {tier === 'verified' && (
        <text
          x={size - 12}
          y={size - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fill="white"
          fontWeight="700"
        >
          ✓
        </text>
      )}
      {tier === 'skilled' && (
        <text
          x={size - 12}
          y={size - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fill="white"
          fontWeight="700"
        >
          ⚡
        </text>
      )}
      {tier === 'official' && (
        <text
          x={size - 12}
          y={size - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fill="white"
          fontWeight="700"
        >
          ★
        </text>
      )}

      {/* Outer ring (subtle glow effect) */}
      <circle
        cx="64"
        cy="64"
        r="64"
        fill="none"
        stroke={tierColor.primary}
        strokeWidth="2"
        opacity="0.3"
      />
    </svg>
  );
};

/**
 * Avatar Component - Displays user avatar or falls back to pattern
 */
export const Avatar = ({
  profilePhoto,
  userId,
  userName = '',
  tier = 'local',
  size = 64,
  className = '',
}) => {
  if (profilePhoto) {
    return (
      <img
        src={profilePhoto}
        alt={userName}
        className={`rounded-full object-cover ${className}`}
        width={size}
        height={size}
      />
    );
  }

  return (
    <div className={className}>
      <KenyanPatternAvatar
        userId={userId}
        userName={userName}
        tier={tier}
        size={size}
      />
    </div>
  );
};

/**
 * Avatar Stack - Display multiple avatars overlapped
 */
export const AvatarStack = ({ users = [], maxDisplay = 3, size = 40 }) => {
  const displayUsers = users.slice(0, maxDisplay);
  const remaining = Math.max(0, users.length - maxDisplay);

  return (
    <div className="flex -space-x-2">
      {displayUsers.map((user, index) => (
        <div
          key={user.id}
          className="border-2 border-white rounded-full"
          style={{ zIndex: displayUsers.length - index }}
        >
          <KenyanPatternAvatar
            userId={user.id}
            userName={user.name}
            tier={user.tier || 'local'}
            size={size}
          />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className="flex items-center justify-center rounded-full border-2 border-white"
          style={{
            width: size,
            height: size,
            backgroundColor: colors.primary[500],
            color: 'white',
            fontSize: size * 0.4,
            fontWeight: 700,
            zIndex: 1,
          }}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

export default KenyanPatternAvatar;
