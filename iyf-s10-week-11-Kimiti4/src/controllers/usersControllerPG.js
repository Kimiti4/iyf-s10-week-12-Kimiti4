/**
 * 🔹 Users Controller - PostgreSQL Version
 * Handles user profiles, admin user management
 */
const { UserRepository, UsersRepository } = require('../database');
const { query } = require('../config/postgres');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

// GET all users (admin/founder only)
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, county, skill, search } = req.query;

  const filters = {};
  if (role) filters.role = role;
  if (county) filters.county = county;
  if (skill) filters.skill = skill;
  if (search) filters.search = search;

  const users = await UsersRepository.findAll(filters);

  res.json({ 
    success: true, 
    count: users.length, 
    data: users 
  });
});

// GET single user
// R1 [P0-2]: any authenticated user can request, but the response is a
// deliberately limited "public-minimal" shape for non-owners.
// Owner / admin / founder see the full canonical profile.
const PUBLIC_MINIMAL_KEYS = new Set(['id', 'username', 'profile', 'verification', 'reputation', 'createdAt']);
const FULL_ONLY_KEYS = new Set(['email', 'mfa', 'currentOrganization', 'updatedAt']);

function isPrivilegedViewer(req) {
  if (!req.user) return false;
  return ['admin', 'founder'].includes(req.user.role);
}

function projectUserForViewer(user, viewer) {
  if (!user) return null;
  if (viewer && (viewer.id === user.id || ['admin', 'founder'].includes(viewer.role))) {
    return user; // owner / admin / founder: full
  }
  // Public-minimal: drop email, mfa, currentOrganization, updatedAt
  const projected = {};
  for (const key of Object.keys(user)) {
    if (PUBLIC_MINIMAL_KEYS.has(key)) projected[key] = user[key];
  }
  return projected;
}

const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await UserRepository.findById(userId);

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Record distinct-viewer profile view (self-views excluded). Best-effort by
  // design: view tracking must never fail the profile read itself. Failures
  // are logged server-side for observability instead of being swallowed.
  if (String(req.user.id) !== String(userId)) {
    await query(
      `INSERT INTO profile_views (viewer_id, viewed_id, last_viewed_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (viewer_id, viewed_id)
       DO UPDATE SET last_viewed_at = NOW()`,
      [req.user.id, userId]
    ).catch((err) => {
      console.warn(`[profile-views] failed to record view of ${userId}: ${err.message}`);
    });
  }

  res.json({ success: true, data: projectUserForViewer(user, req.user) });
});

// GET current user profile
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await UserRepository.findById(req.user.id);

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({ success: true, data: user });
});

// UPDATE current user profile
const updateProfile = asyncHandler(async (req, res) => {
  const {
    bio,
    location_county,
    location_settlement,
    location_ward,
    skills,
    avatar_url,
    avatar_icon
  } = req.body;

  const updates = {};
  if (bio !== undefined) updates.bio = bio;
  if (location_county !== undefined) updates.location_county = location_county;
  if (location_settlement !== undefined) updates.location_settlement = location_settlement;
  if (location_ward !== undefined) updates.location_ward = location_ward;
  if (skills !== undefined) updates.skills = skills;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;
  if (avatar_icon !== undefined) updates.avatar_icon = avatar_icon;

  const user = await UsersRepository.updateProfile(req.user.id, updates);

  res.json({ success: true, data: user });
});

// GET user statistics
// R1 [P2-8]: owner / admin / founder only. An authenticated user who is not
// the owner and not privileged cannot pass an arbitrary :id.
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.params.id || req.user.id;
  const isSelf = userId === req.user.id;
  const isPrivileged = ['admin', 'founder'].includes(req.user.role);
  if (!isSelf && !isPrivileged) {
    throw new ApiError('You can only read your own stats', 403);
  }
  const stats = await UsersRepository.getUserStats(userId);

  if (!stats) {
    throw new ApiError('User not found', 404);
  }

  res.json({ success: true, data: stats });
});

// ADMIN: Ban user
const banUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new ApiError('Ban reason is required', 400);
  }

  const user = await UsersRepository.banUser(userId, reason, req.user.id);

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({ success: true, message: 'User banned', data: user });
});

// ADMIN: Unban user
const unbanUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await UsersRepository.unbanUser(userId);

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({ success: true, message: 'User unbanned', data: user });
});

// ADMIN: Update user role
const updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  const validRoles = ['user', 'admin', 'moderator'];
  if (!validRoles.includes(role)) {
    throw new ApiError('Invalid role', 400);
  }

  const { query } = require('../config/postgres');
  const result = await query(`
    UPDATE users
    SET role = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `, [role, userId]);

  const user = result.rows[0];

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({ success: true, message: 'User role updated', data: user });
});

// GET follow state + counts for a user, relative to the viewer
const getFollowState = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const target = await UserRepository.findById(userId);
  if (!target) {
    throw new ApiError('User not found', 404);
  }
  const [following, followers, followingCount, viewCount] = await Promise.all([
    query(`SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2`, [req.user.id, userId]),
    query(`SELECT COUNT(*)::int AS n FROM follows WHERE following_id = $1`, [userId]),
    query(`SELECT COUNT(*)::int AS n FROM follows WHERE follower_id = $1`, [userId]),
    query(`SELECT COUNT(*)::int AS n FROM profile_views WHERE viewed_id = $1`, [userId])
  ]);
  res.json({
    success: true,
    data: {
      userId,
      isFollowing: following.rows.length > 0,
      isOwnProfile: String(req.user.id) === String(userId),
      followers: followers.rows[0].n,
      following: followingCount.rows[0].n,
      profileViews: viewCount.rows[0].n
    }
  });
});

// POST follow a user
const followUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (String(userId) === String(req.user.id)) {
    throw new ApiError('Cannot follow yourself', 400);
  }
  const target = await UserRepository.findById(userId);
  if (!target) {
    throw new ApiError('User not found', 404);
  }
  await query(
    `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [req.user.id, userId]
  );
  // Notify the followed user (persisted + realtime; failures never fail the follow)
  try {
    const { createNotification, emitToUser } = require('./notificationsControllerPG');
    const note = await createNotification({
      userId, actorId: req.user.id, type: 'follow', targetType: 'user', referenceId: req.user.id
    });
    emitToUser(userId, 'notification:new', { id: note.id, type: 'follow' });
  } catch {
    // Notification delivery is best-effort
  }
  res.status(201).json({ success: true, message: 'Following user', data: { userId, isFollowing: true } });
});

// DELETE unfollow a user
const unfollowUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  await query(`DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`, [req.user.id, userId]);
  res.json({ success: true, message: 'Unfollowed user', data: { userId, isFollowing: false } });
});

// GET liked posts (own only — liked posts are private to the owner)
const getLikedPosts = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT p.*
     FROM post_likes l
     JOIN posts p ON p.id = l.post_id
     WHERE l.user_id = $1
     ORDER BY l.created_at DESC
     LIMIT 50`,
    [req.user.id]
  );
  res.json({ success: true, count: result.rows.length, data: result.rows });
});

module.exports = {
  getAllUsers,
  getUserById,
  getMyProfile,
  updateProfile,
  getUserStats,
  banUser,
  unbanUser,
  updateUserRole,
  getFollowState,
  followUser,
  unfollowUser,
  getLikedPosts
};
