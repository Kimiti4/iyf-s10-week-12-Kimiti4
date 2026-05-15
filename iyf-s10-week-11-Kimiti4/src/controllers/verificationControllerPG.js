/**
 * 🔹 Verification Controller - PostgreSQL Version
 * Handles user and organization verification with distinctive badges
 */
const { UserRepository, OrganizationRepository } = require('../database');
const { query } = require('../config/postgres');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

// ===== USER VERIFICATION =====

/**
 * Get badge configuration based on level
 */
const getBadgeConfig = (level, type = 'user') => {
  const configs = {
    bronze: {
      icon: '🥉', color: '#CD7F32', gradient: 'linear-gradient(135deg, #CD7F32 0%, #B87333 100%)',
      borderColor: '#CD7F32', glowColor: 'rgba(205, 127, 50, 0.3)',
      label: 'Verified Member', description: 'Identity verified'
    },
    silver: {
      icon: '🥈', color: '#C0C0C0', gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)',
      borderColor: '#C0C0C0', glowColor: 'rgba(192, 192, 192, 0.4)',
      label: 'Trusted Member', description: 'Active community contributor'
    },
    gold: {
      icon: '🥇', color: '#FFD700', gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      borderColor: '#FFD700', glowColor: 'rgba(255, 215, 0, 0.5)',
      label: 'Gold Member', description: 'Highly trusted contributor'
    },
    platinum: {
      icon: '💎', color: '#E5E4E2', gradient: 'linear-gradient(135deg, #E5E4E2 0%, #B0E0E6 100%)',
      borderColor: '#E5E4E2', glowColor: 'rgba(229, 228, 226, 0.6)',
      label: 'Platinum Member', description: 'Elite community leader'
    },
    diamond: {
      icon: '👑', color: '#B9F2FF', gradient: 'linear-gradient(135deg, #B9F2FF 0%, #00BFFF 50%, #1E90FF 100%)',
      borderColor: '#00BFFF', glowColor: 'rgba(0, 191, 255, 0.7)',
      label: 'Diamond Member', description: 'Platform ambassador'
    },
    verified: {
      icon: '✓', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      borderColor: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.4)',
      label: 'Verified Organization', description: 'Official organization'
    },
    premium: {
      icon: '⭐', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      borderColor: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.5)',
      label: 'Premium Partner', description: 'Verified premium partner'
    },
    partner: {
      icon: '🤝', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      borderColor: '#8b5cf6', glowColor: 'rgba(139, 92, 246, 0.5)',
      label: 'Strategic Partner', description: 'Official strategic partner'
    },
    official: {
      icon: '🏛️', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      borderColor: '#10b981', glowColor: 'rgba(16, 185, 129, 0.6)',
      label: 'Official Institution', description: 'Government/educational institution'
    }
  };
  
  return configs[level] || configs.bronze;
};

/**
 * Verify a user (Admin only)
 */
const verifyUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { 
    badgeLevel = 'bronze',
    verificationType = 'manual',
    notes = '',
    expiresInDays 
  } = req.body;
  
  const user = await UserRepository.findById(userId);
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  
  const badgeConfig = getBadgeConfig(badgeLevel, 'user');
  const expiresAt = expiresInDays 
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;
  
  // Update user verification
  await query(`
    UPDATE users
    SET 
      verification_is_verified = TRUE,
      verification_verified_at = NOW(),
      verification_verified_by = $1,
      verification_type = $2,
      verification_badge_level = $3,
      verification_badge_color = $4,
      verification_notes = $5,
      verification_expires_at = $6,
      updated_at = NOW()
    WHERE id = $7
  `, [req.user.id, verificationType, badgeLevel, badgeConfig.color, notes, expiresAt, userId]);
  
  const updatedUser = await UserRepository.findById(userId);
  
  res.json({
    success: true,
    message: 'User verified successfully',
    data: {
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        verification: {
          isVerified: updatedUser.verification_is_verified,
          badgeLevel: updatedUser.verification_badge_level,
          badgeColor: updatedUser.verification_badge_color
        }
      },
      badge: badgeConfig
    }
  });
});

/**
 * Unverify a user (Admin only)
 */
const unverifyUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;
  
  const user = await UserRepository.findById(userId);
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  
  await query(`
    UPDATE users
    SET 
      verification_is_verified = FALSE,
      verification_verified_at = NULL,
      verification_verified_by = NULL,
      verification_type = 'manual',
      verification_badge_level = 'bronze',
      verification_badge_color = '#CD7F32',
      verification_notes = $1,
      verification_expires_at = NULL,
      updated_at = NOW()
    WHERE id = $2
  `, [reason || 'Verification removed by admin', userId]);
  
  res.json({
    success: true,
    message: 'User verification removed'
  });
});

/**
 * Get user's badge information
 */
const getUserBadge = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await UserRepository.findById(userId);
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  
  const badgeConfig = user.verification_is_verified 
    ? getBadgeConfig(user.verification_badge_level, 'user')
    : null;
  
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username
      },
      isVerified: user.verification_is_verified,
      badge: badgeConfig,
      verifiedAt: user.verification_verified_at,
      expiresAt: user.verification_expires_at
    }
  });
});

// ===== ORGANIZATION VERIFICATION =====

/**
 * Verify an organization (Admin only)
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
  
  const org = await OrganizationRepository.findById(orgId);
  if (!org) {
    throw new ApiError('Organization not found', 404);
  }
  
  const badgeConfig = getBadgeConfig(badgeLevel, 'organization');
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;
  
  await query(`
    UPDATE organizations
    SET 
      verification_is_verified = TRUE,
      verification_verified_at = NOW(),
      verification_verified_by = $1,
      verification_type = $2,
      verification_badge_level = $3,
      verification_badge_icon = $4,
      verification_badge_color = $5,
      verification_badge_gradient = $6,
      verification_notes = $7,
      verification_expires_at = $8,
      updated_at = NOW()
    WHERE id = $9
  `, [
    req.user.id, verificationType, badgeLevel, 
    customIcon || badgeConfig.icon,
    customColor || badgeConfig.color,
    customGradient ? JSON.stringify(customGradient) : null,
    notes, expiresAt, orgId
  ]);
  
  const updatedOrg = await OrganizationRepository.findById(orgId);
  
  res.json({
    success: true,
    message: 'Organization verified successfully',
    data: {
      organization: {
        id: updatedOrg.id,
        name: updatedOrg.name,
        slug: updatedOrg.slug,
        verification: {
          isVerified: updatedOrg.verification_is_verified,
          badgeLevel: updatedOrg.verification_badge_level
        }
      },
      badge: badgeConfig
    }
  });
});

/**
 * Unverify an organization (Admin only)
 */
const unverifyOrganization = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const { reason } = req.body;
  
  const org = await OrganizationRepository.findById(orgId);
  if (!org) {
    throw new ApiError('Organization not found', 404);
  }
  
  await query(`
    UPDATE organizations
    SET 
      verification_is_verified = FALSE,
      verification_verified_at = NULL,
      verification_verified_by = NULL,
      verification_type = 'manual',
      verification_badge_level = 'verified',
      verification_badge_icon = '✓',
      verification_badge_color = '#3b82f6',
      verification_notes = $1,
      verification_expires_at = NULL,
      updated_at = NOW()
    WHERE id = $2
  `, [reason || 'Verification removed by admin', orgId]);
  
  res.json({
    success: true,
    message: 'Organization verification removed'
  });
});

/**
 * Get organization's badge information
 */
const getOrganizationBadge = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  
  const org = await OrganizationRepository.findById(orgId);
  if (!org) {
    throw new ApiError('Organization not found', 404);
  }
  
  const badgeConfig = org.verification_is_verified
    ? getBadgeConfig(org.verification_badge_level, 'organization')
    : null;
  
  res.json({
    success: true,
    data: {
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug
      },
      isVerified: org.verification_is_verified,
      badge: badgeConfig,
      verifiedAt: org.verification_verified_at,
      expiresAt: org.verification_expires_at
    }
  });
});

/**
 * Get all badge configurations
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
  verifyUser,
  unverifyUser,
  getUserBadge,
  verifyOrganization,
  unverifyOrganization,
  getOrganizationBadge,
  getBadgeConfigs
};
