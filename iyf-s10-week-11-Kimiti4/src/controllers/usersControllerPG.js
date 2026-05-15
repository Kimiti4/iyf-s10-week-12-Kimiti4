/**
 * 🔹 Users Controller - PostgreSQL Version
 * Handles user profiles, admin user management
 */
const { UserRepository, UsersRepository } = require('../database');
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
const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const user = await UserRepository.findById(userId);

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  res.json({ success: true, data: user });
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
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.params.id || req.user.id;
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

module.exports = {
  getAllUsers,
  getUserById,
  getMyProfile,
  updateProfile,
  getUserStats,
  banUser,
  unbanUser,
  updateUserRole
};
