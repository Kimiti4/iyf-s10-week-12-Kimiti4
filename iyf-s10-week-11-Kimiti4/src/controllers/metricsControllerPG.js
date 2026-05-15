/**
 * 🔹 Metrics Controller - PostgreSQL Version
 * Provides realistic platform statistics and user analytics
 */
const { UserRepository, OrganizationRepository, PostRepository } = require('../database');
const { query } = require('../config/postgres');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/metrics/platform - Platform-wide statistics
const getPlatformMetrics = asyncHandler(async (req, res) => {
  const stats = await query(`
    SELECT
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM organizations) as total_organizations,
      (SELECT COUNT(*) FROM posts) as total_posts,
      (SELECT COUNT(*) FROM comments) as total_comments,
      (SELECT COUNT(*) FROM memberships WHERE status = 'accepted') as total_memberships
  `);
  
  res.json({
    success: true,
    data: stats.rows[0]
  });
});

// GET /api/metrics/trending - Get trending posts
const getTrendingContent = asyncHandler(async (req, res) => {
  const { limit = 10, timeWindow = '24h' } = req.query;
  
  const hours = timeWindow === '24h' ? 24 : timeWindow === '7d' ? 168 : 720;
  
  const trending = await query(`
    SELECT 
      p.*,
      COUNT(c.id) as comment_count,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'avatar_icon', u.avatar_icon
      ) as author
    FROM posts p
    LEFT JOIN comments c ON c.post_id = p.id
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.created_at > NOW() - INTERVAL '${hours} hours'
    GROUP BY p.id, u.id
    ORDER BY comment_count DESC, p.created_at DESC
    LIMIT $1
  `, [parseInt(limit)]);
  
  res.json({
    success: true,
    count: trending.rows.length,
    data: trending.rows
  });
});

// GET /api/metrics/users/:userId/activity - User activity stats
const getUserMetrics = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await UserRepository.findById(userId);
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  
  const stats = await query(`
    SELECT
      (SELECT COUNT(*) FROM posts WHERE author_id = $1) as post_count,
      (SELECT COUNT(*) FROM comments WHERE author_id = $1) as comment_count,
      (SELECT COUNT(*) FROM memberships WHERE user_id = $1 AND status = 'accepted') as organization_count,
      (SELECT COUNT(*) FROM posts WHERE author_id = $1 AND created_at > NOW() - INTERVAL '30 days') as posts_last_30_days,
      reputation_score,
      login_streak,
      last_login_at
    FROM users
    WHERE id = $1
  `, [userId]);
  
  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        avatarIcon: user.avatar_icon
      },
      stats: stats.rows[0]
    }
  });
});

// GET /api/metrics/organizations/:orgId/health - Organization health metrics
const getOrgMetrics = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  
  const org = await OrganizationRepository.findById(orgId);
  if (!org) {
    throw new ApiError('Organization not found', 404);
  }
  
  const health = await query(`
    SELECT
      o.id,
      o.name,
      o.slug,
      (SELECT COUNT(*) FROM memberships WHERE organization_id = $1 AND status = 'accepted') as member_count,
      (SELECT COUNT(*) FROM posts WHERE organization_id = $1) as post_count,
      (SELECT COUNT(*) FROM posts WHERE organization_id = $1 AND created_at > NOW() - INTERVAL '7 days') as posts_this_week,
      (SELECT COUNT(DISTINCT author_id) FROM posts WHERE organization_id = $1 AND created_at > NOW() - INTERVAL '7 days') as active_contributors_this_week,
      (SELECT AVG(extract(epoch FROM (NOW() - created_at))) / 86400 FROM posts WHERE organization_id = $1) as avg_post_age_days
    FROM organizations o
    WHERE o.id = $1
  `, [orgId]);
  
  res.json({
    success: true,
    data: health.rows[0]
  });
});

// GET /api/metrics/users/:userId/avatar-icon - Get or generate user's avatar icon
const getUserAvatarIcon = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await UserRepository.findById(userId);
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  
  // If user has an icon, return it
  if (user.avatar_icon) {
    return res.json({
      success: true,
      data: {
        icon: user.avatar_icon,
        userId: user.id,
        username: user.username
      }
    });
  }
  
  // Generate deterministic icon based on user ID
  const { getIconForUser } = require('../utils/avatarIconGenerator');
  const icon = getIconForUser(user.id.toString(), user.username);
  
  // Save to user profile
  await query(`
    UPDATE users
    SET avatar_icon = $1, updated_at = NOW()
    WHERE id = $2
  `, [icon, userId]);
  
  res.json({
    success: true,
    data: {
      icon,
      userId: user.id,
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
