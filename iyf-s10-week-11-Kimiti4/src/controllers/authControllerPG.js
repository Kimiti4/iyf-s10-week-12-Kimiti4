/**
 * 🔹 Authentication Controller - PostgreSQL Version
 * Register, login, get current user, logout
 */
const { UserRepository } = require('../database');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register new user with enhanced validation
 */
const register = asyncHandler(async (req, res) => {
  const { username, email, password, profile } = req.body;
  
  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username, email, and password are required'
    });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a valid email address'
    });
  }
  
  // Check for existing user
  const existingByEmail = await UserRepository.findByEmail(email.toLowerCase());
  const existingByUsername = await UserRepository.findByUsername(username.trim());
  
  if (existingByEmail) {
    return res.status(400).json({
      success: false,
      error: 'Email is already registered'
    });
  }

  if (existingByUsername) {
    return res.status(400).json({
      success: false,
      error: 'Username is already taken'
    });
  }
  
  // Create user
  const user = await UserRepository.create({
    username: username.trim(),
    email: email.toLowerCase().trim(),
    password,
    profile: profile || {}
  });
  
  // Generate token
  const token = generateToken(user.id);
  
  // Send response (exclude password)
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile,
      createdAt: user.createdAt
    }
  });
});

/**
 * Login user with enhanced security
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide email and password'
    });
  }
  
  // Find user
  const user = await UserRepository.findByEmail(email.toLowerCase());
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
  
  // Get full user with password for comparison
  const { query } = require('../config/postgres');
  const result = await query('SELECT * FROM users WHERE id = $1', [user.id]);
  const fullUser = result.rows[0];
  
  // Check password
  const isMatch = await UserRepository.comparePassword(fullUser, password);
  
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
  
  // Generate token
  const token = generateToken(user.id);
  
  // Send response
  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile,
      isFounder: user.isFounder,
      verification: user.verification
    }
  });
});

/**
 * Logout user (token is invalidated on client side)
 */
const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Token has been invalidated on client side.'
  });
});

/**
 * Get current user profile
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await UserRepository.findById(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  
  // Get user's organizations
  const organizations = await UserRepository.getUserOrganizations(user.id);
  
  res.json({
    success: true,
    user: {
      ...user,
      organizations,
      stats: {
        memberSince: user.createdAt
      }
    }
  });
});

/**
 * Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { bio, location, skills, avatarIcon } = req.body;
  
  const updates = {};
  if (bio !== undefined) updates.bio = bio;
  if (location?.county !== undefined) updates.locationCounty = location.county;
  if (location?.settlement !== undefined) updates.locationSettlement = location.settlement;
  if (location?.ward !== undefined) updates.locationWard = location.ward;
  if (skills !== undefined) updates.skills = `{${skills.join(',')}}`;
  if (avatarIcon !== undefined) updates.avatarIcon = avatarIcon;
  
  const user = await UserRepository.update(req.user.id, updates);
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
});

/**
 * Change password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      error: 'Please provide current password and new password'
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      error: 'New passwords do not match'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 6 characters long'
    });
  }

  // Get user with password
  const { query } = require('../config/postgres');
  const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  const user = result.rows[0];

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Verify current password
  const isMatch = await UserRepository.comparePassword(user, currentPassword);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: 'Current password is incorrect'
    });
  }

  // Update password (UserRepository handles hashing)
  const bcryptjs = require('bcryptjs');
  const hashedPassword = await bcryptjs.hash(newPassword, 10);

  const updateResult = await query(
    'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id, username, email',
    [hashedPassword, req.user.id]
  );

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

module.exports = { register, login, logout, getMe, updateProfile, changePassword };
