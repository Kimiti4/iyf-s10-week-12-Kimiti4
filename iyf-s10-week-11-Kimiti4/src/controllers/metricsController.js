/**
 * 🔹 Metrics Controller
 * Provides realistic platform statistics and user analytics
 */
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const {
  getTrendingPosts,
  getUserActivityStats,
  getOrganizationHealth,
  getPlatformStats
} = require('../utils/realisticMetrics');
const User = require('../models/User');

// GET /api/metrics/platform - Platform-wide statistics
const getPlatformMetrics = asyncHandler(async (req, res) => {
  const stats = await getPlatformStats();
  
  res.json({
    success: true,
    data: stats
  });
});

// GET /api/metrics/trending - Get trending posts
const getTrendingContent = asyncHandler(async (req, res) => {
  const { limit = 10, timeWindow = '24h' } = req.query;
  
  const trending = await getTrendingPosts(
    parseInt(limit),
    timeWindow
  );
  
  res.json({
    success: true,
    count: trending.length,
    data: trending
  });
});

// GET /api/metrics/users/:userId/activity - User activity stats
const getUserMetrics = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  
  const stats = await getUserActivityStats(userId);
  
  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        username: user.username,
        avatarIcon: user.profile?.avatarIcon
      },
      ...stats
    }
  });
});

// GET /api/metrics/organizations/:orgId/health - Organization health metrics
const getOrgMetrics = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  
  const health = await getOrganizationHealth(orgId);
  
  if (!health) {
    throw new ApiError('Organization not found', 404);
  }
  
  res.json({
    success: true,
    data: health
  });
});

// GET /api/metrics/users/:userId/avatar-icon - Get or generate user's avatar icon
const getUserAvatarIcon = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await User.findById(userId).select('profile.avatarIcon username _id');
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  
  // If user has an icon, return it
  if (user.profile?.avatarIcon) {
    return res.json({
      success: true,
      data: {
        icon: user.profile.avatarIcon,
        userId: user._id,
        username: user.username
      }
    });
  }
  
  // Generate deterministic icon based on user ID
  const { getIconForUser } = require('../utils/avatarIconGenerator');
  const icon = getIconForUser(user._id.toString(), user.username);
  
  // Save to user profile
  user.profile = user.profile || {};
  user.profile.avatarIcon = icon;
  await user.save();
  
  res.json({
    success: true,
    data: {
      icon,
      userId: user._id,
      username: user.username,
      generated: true
    }
  });
});

module.exports = {
  getPlatformMetrics,
  getTrendingContent,
  getUserMetrics,
  getOrgMetrics,
  getUserAvatarIcon
};
