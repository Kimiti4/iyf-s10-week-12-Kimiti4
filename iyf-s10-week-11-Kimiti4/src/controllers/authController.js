/**
 * 🔹 Authentication Controller
 * Register, login, get current user
 */
const User = require('../models/User');
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
  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }]
  });
  
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'User with this email or username already exists'
    });
  }
  
  // Create user (password hashed by pre-save hook)
  const user = await User.create({
    username: username.trim(),
    email: email.toLowerCase().trim(),
    password,
    profile: profile || {}
  });
  
  // Generate token
  const token = generateToken(user._id);
  
  // Send response (exclude password)
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
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
  
  // Find user and include password for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
  
  // Check password
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
  
  // Generate token
  const token = generateToken(user._id);
  
  // Send response
  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile
    }
  });
});

/**
 * Get current user profile
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: 'posts',
      select: 'title category likes createdAt',
      options: { sort: { createdAt: -1 }, limit: 10 }
    });
  
  res.json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile: user.profile,
      stats: {
        totalPosts: user.posts?.length || 0,
        memberSince: user.createdAt
      }
    }
  });
});

/**
 * Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { bio, location, skills } = req.body;
  
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      'profile.bio': bio,
      'profile.location': location,
      'profile.skills': skills
    },
    { new: true, runValidators: true }
  ).select('-password');
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
});

module.exports = { register, login, getMe, updateProfile };
