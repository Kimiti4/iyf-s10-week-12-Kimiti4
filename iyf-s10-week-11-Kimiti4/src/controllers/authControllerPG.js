/**
 * 🔹 Authentication Controller - PostgreSQL Version
 * Register, login, get current user
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
 * Register new user
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
  
  // Check for existing user
  const existingByEmail = await UserRepository.findByEmail(email.toLowerCase());
  const existingByUsername = await UserRepository.findByUsername(username.trim());
  
  if (existingByEmail || existingByUsername) {
    return res.status(400).json({
      success: false,
      error: 'User with this email or username already exists'
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
 * Login user
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

module.exports = { register, login, getMe, updateProfile };
