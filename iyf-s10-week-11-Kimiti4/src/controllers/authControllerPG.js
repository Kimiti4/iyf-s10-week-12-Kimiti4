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

const otplib = require('otplib');
const qrcode = require('qrcode');
const nodemailer = require('nodemailer');

// In-memory store for email/bot verification codes
// Format: { 'emailOrPhone': { code: '123456', expiresAt: 123456789 } }
const verificationCodes = new Map();

// Generate a 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Send Verification Code
 */
const sendVerification = asyncHandler(async (req, res) => {
  const { method, contact } = req.body;
  
  if (!method || !contact) {
    return res.status(400).json({ success: false, error: 'Method and contact are required' });
  }

  if (method === 'totp') {
    // Generate TOTP secret and QR code for Authenticator apps
    const secret = otplib.authenticator.generateSecret();
    const otpauth = otplib.authenticator.keyuri(contact, 'JamiiLink', secret);
    
    const qrCodeDataUrl = await qrcode.toDataURL(otpauth);
    
    return res.json({
      success: true,
      message: 'TOTP setup generated',
      data: { secret, qrCode: qrCodeDataUrl }
    });
  }

  // Generate standard 6-digit code for Email/Phone
  const code = generateCode();
  verificationCodes.set(contact, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

  if (method === 'email') {
    // Configure Ethereal Email (Mock SMTP for dev)
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });

    const info = await transporter.sendMail({
      from: '"JamiiLink Security" <security@jamiilink.com>',
      to: contact,
      subject: 'Your JamiiLink Verification Code',
      text: `Your verification code is: ${code}`,
      html: `<h2>Welcome to JamiiLink!</h2><p>Your verification code is: <strong>${code}</strong></p>`
    });

    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
    return res.json({
      success: true,
      message: 'Verification code sent via Email (Check server console for preview URL)'
    });
  } else if (method === 'phone') {
    // Simulated WhatsApp/Telegram Bot
    console.log(`[BOT SIMULATION] Sending WhatsApp/Telegram message to ${contact}: Your code is ${code}`);
    
    return res.json({
      success: true,
      message: 'Verification code sent via Messaging App'
    });
  }

  res.status(400).json({ success: false, error: 'Invalid verification method' });
});

/**
 * Verify Code
 */
const verifyCode = asyncHandler(async (req, res) => {
  const { method, contact, code, secret } = req.body;

  if (!method || !contact || !code) {
    return res.status(400).json({ success: false, error: 'Method, contact, and code are required' });
  }

  if (method === 'totp') {
    if (!secret) return res.status(400).json({ success: false, error: 'TOTP secret required for verification' });
    
    const isValid = otplib.authenticator.check(code, secret);
    if (!isValid) return res.status(400).json({ success: false, error: 'Invalid authenticator code' });
    
    return res.json({ success: true, message: 'Code verified successfully' });
  }

  // Handle Email/Phone
  const record = verificationCodes.get(contact);
  
  if (!record) {
    return res.status(400).json({ success: false, error: 'No verification code requested or it expired' });
  }
  
  if (Date.now() > record.expiresAt) {
    verificationCodes.delete(contact);
    return res.status(400).json({ success: false, error: 'Verification code expired' });
  }
  
  if (record.code !== code) {
    return res.status(400).json({ success: false, error: 'Invalid verification code' });
  }
  
  // Clean up code after successful verification
  verificationCodes.delete(contact);

  res.json({ success: true, message: 'Code verified successfully' });
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

module.exports = { register, login, logout, getMe, updateProfile, changePassword, sendVerification, verifyCode };
