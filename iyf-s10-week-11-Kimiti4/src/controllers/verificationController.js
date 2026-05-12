/**
 * 🔹 Verification Controller - JamiiLink Unique Badge System
 * Handles user and organization verification with distinctive badges
 */
const User = require('../models/User');
const Organization = require('../models/Organization');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

// ===== USER VERIFICATION =====

/**
 * Get badge configuration based on level
 * Returns unique visual properties for each badge tier
 */
const getBadgeConfig = (level, type = 'user') => {
  const configs = {
    // User Badge Levels
    bronze: {
      icon: '🥉',
      color: '#CD7F32',
      gradient: 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)',
      borderColor: '#CD7F32',
      glowColor: 'rgba(205, 127, 50, 0.3)',
      label: 'Verified Member',
      description: 'Identity verified'
    },
    silver: {
      icon: '🥈',
      color: '#C0C0C0',
      gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)',
      borderColor: '#C0C0C0',
      glowColor: 'rgba(192, 192, 192, 0.4)',
      label: 'Trusted Member',
      description: 'Active community contributor'
    },
    gold: {
      icon: '🥇',
      color: '#FFD700',
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      borderColor: '#FFD700',
      glowColor: 'rgba(255, 215, 0, 0.5)',
      label: 'Gold Member',
      description: 'Highly trusted contributor'
    },
    platinum: {
      icon: '💎',
      color: '#E5E4E2',
      gradient: 'linear-gradient(135deg, #E5E4E2 0%, #B0E0E6 100%)',
      borderColor: '#E5E4E2',
      glowColor: 'rgba(229, 228, 226, 0.6)',
      label: 'Platinum Member',
      description: 'Elite community leader'
    },
    diamond: {
      icon: '👑',
      color: '#B9F2FF',
      gradient: 'linear-gradient(135deg, #B9F2FF 0%, #00BFFF 50%, #1E90FF 100%)',
      borderColor: '#00BFFF',
      glowColor: 'rgba(0, 191, 255, 0.7)',
      label: 'Diamond Member',
      description: 'Platform ambassador'
    },
    
    // Organization Badge Levels
    verified: {
      icon: '✓',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      borderColor: '#3b82f6',
      glowColor: 'rgba(59, 130, 246, 0.4)',
      label: 'Verified Organization',
      description: 'Official organization'
    },
    premium: {
      icon: '⭐',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      borderColor: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.5)',
      label: 'Premium Partner',
      description: 'Verified premium partner'
    },
    partner: {
      icon: '🤝',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      borderColor: '#8b5cf6',
      glowColor: 'rgba(139, 92, 246, 0.5)',
      label: 'Strategic Partner',
      description: 'Official strategic partner'
    },
    official: {
      icon: '🏛️',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      borderColor: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.6)',
      label: 'Official Institution',
      description: 'Government/educational institution'
    }
  };
  
  return configs[level] || configs.bronze;
};

/**
 * Verify a user (Admin only)
 * POST /api/verification/users/:userId/verify
 */
const verifyUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { 
    badgeLevel = 'bronze',
    verificationType = 'manual',
    notes = '',
    expiresInDays 
  } = req.body;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  
  // Get badge configuration
  const badgeConfig = getBadgeConfig(badgeLevel, 'user');
  
  // Calculate expiry if provided
  const expiresAt = expiresInDays 
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;
  
  // Update user verification
  user.verification = {
    isVerified: true,
    verifiedAt: new Date(),
    verifiedBy: req.user._id,
    verificationType,
    badgeLevel,
    badgeColor: badgeConfig.color,
    verificationNotes: notes,
    expiresAt
  };
  
  await user.save();
  
  res.json({
    success: true,
    message: 'User verified successfully',
    data: {
      user: {
        _id: user._id,
        username: user.username,
        verification: user.verification
      },
      badge: badgeConfig
    }
  });
});

/**
 * Unverify a user (Admin only)
 * DELETE /api/verification/users/:userId/verify
 */
const unverifyUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;
  
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  
  user.verification = {
    isVerified: false,
    verifiedAt: null,
    verifiedBy: null,
    verificationType: 'manual',
    badgeLevel: 'bronze',
    badgeColor: '#CD7F32',
    verificationNotes: reason || 'Verification removed by admin'
  };
  
  await user.save();
  
  res.json({
    success: true,
    message: 'User verification removed',
    data: {
      user: {
        _id: user._id,
        username: user.username,
        verification: user.verification
      }
    }
  });
});

/**
 * Get user's badge information
 * GET /api/verification/users/:userId/badge
 */
const getUserBadge = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await User.findById(userId).select('username verification');
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  
  const badgeConfig = user.verification.isVerified 
    ? getBadgeConfig(user.verification.badgeLevel, 'user')
    : null;
  
  res.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        username: user.username
      },
      isVerified: user.verification.isVerified,
      badge: badgeConfig,
      verifiedAt: user.verification.verifiedAt,
      expiresAt: user.verification.expiresAt
    }
  });
});

// ===== ORGANIZATION VERIFICATION =====

/**
 * Verify an organization (Admin only)
 * POST /api/verification/organizations/:orgId/verify
 */
const verifyOrganization = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const {
    badgeLevel = 'verified',
    verificationType = 'manual',
    notes = '',
    customIcon,
    customColor,
    customGradient,
    expiresInDays
  } = req.body;
  
  const org = await Organization.findById(orgId);
  if (!org) {
    throw new ApiError('Organization not found', 404);
  }
  
  const badgeConfig = getBadgeConfig(badgeLevel, 'organization');
  
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;
  
  org.verification = {
    isVerified: true,
    verifiedAt: new Date(),
    verifiedBy: req.user._id,
    verificationType,
    badgeLevel,
    badgeIcon: customIcon || badgeConfig.icon,
    badgeColor: customColor || badgeConfig.color,
    badgeGradient: customGradient || {
      start: badgeConfig.gradient.includes('#') ? badgeConfig.color : badgeConfig.gradient,
      end: badgeConfig.color
    },
    verificationNotes: notes,
    expiresAt
  };
  
  await org.save();
  
  res.json({
    success: true,
    message: 'Organization verified successfully',
    data: {
      organization: {
        _id: org._id,
        name: org.name,
        slug: org.slug,
        verification: org.verification
      },
      badge: badgeConfig
    }
  });
});

/**
 * Unverify an organization (Admin only)
 * DELETE /api/verification/organizations/:orgId/verify
 */
const unverifyOrganization = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const { reason } = req.body;
  
  const org = await Organization.findById(orgId);
  if (!org) {
    throw new ApiError('Organization not found', 404);
  }
  
  org.verification = {
    isVerified: false,
    verifiedAt: null,
    verifiedBy: null,
    verificationType: 'manual',
    badgeLevel: 'verified',
    badgeIcon: '✓',
    badgeColor: '#3b82f6',
    badgeGradient: {
      start: '#3b82f6',
      end: '#8b5cf6'
    },
    verificationNotes: reason || 'Verification removed by admin'
  };
  
  await org.save();
  
  res.json({
    success: true,
    message: 'Organization verification removed',
    data: {
      organization: {
        _id: org._id,
        name: org.name,
        verification: org.verification
      }
    }
  });
});

/**
 * Get organization's badge information
 * GET /api/verification/organizations/:orgId/badge
 */
const getOrganizationBadge = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  
  const org = await Organization.findById(orgId).select('name slug verification');
  if (!org) {
    throw new ApiError('Organization not found', 404);
  }
  
  const badgeConfig = org.verification.isVerified
    ? getBadgeConfig(org.verification.badgeLevel, 'organization')
    : null;
  
  res.json({
    success: true,
    data: {
      organization: {
        _id: org._id,
        name: org.name,
        slug: org.slug
      },
      isVerified: org.verification.isVerified,
      badge: badgeConfig,
      verifiedAt: org.verification.verifiedAt,
      expiresAt: org.verification.expiresAt
    }
  });
});

/**
 * Get all badge configurations (for frontend rendering)
 * GET /api/verification/badges/config
 */
const getBadgeConfigs = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      userBadges: {
        bronze: getBadgeConfig('bronze', 'user'),
        silver: getBadgeConfig('silver', 'user'),
        gold: getBadgeConfig('gold', 'user'),
        platinum: getBadgeConfig('platinum', 'user'),
        diamond: getBadgeConfig('diamond', 'user')
      },
      organizationBadges: {
        verified: getBadgeConfig('verified', 'organization'),
        premium: getBadgeConfig('premium', 'organization'),
        partner: getBadgeConfig('partner', 'organization'),
        official: getBadgeConfig('official', 'organization')
      }
    }
  });
});

module.exports = {
  // User verification
  verifyUser,
  unverifyUser,
  getUserBadge,
  
  // Organization verification
  verifyOrganization,
  unverifyOrganization,
  getOrganizationBadge,
  
  // Badge system
  getBadgeConfigs
};
