/**
 * 🔹 Alert Controller
 * Handles alert CRUD operations, verification, and realtime updates
 */

const Alert = require('../models/Alert');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../middleware/logger');

// @desc    Get all alerts with filtering
// @route   GET /api/alerts
// @access  Public
exports.getAlerts = asyncHandler(async (req, res) => {
  const { 
    category, 
    severity, 
    verificationLevel, 
    status = 'active',
    limit = 50,
    page = 1
  } = req.query;

  // Build query
  const query = { status };
  
  if (category && category !== 'all') {
    query.category = category;
  }
  
  if (severity) {
    query.severity = severity;
  }
  
  if (verificationLevel) {
    query.verificationLevel = verificationLevel;
  }

  // Pagination
  const skip = (page - 1) * limit;
  
  const alerts = await Alert.find(query)
    .populate('author', 'username avatar profile.verified')
    .populate('organization', 'name slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Alert.countDocuments(query);

  res.json({
    success: true,
    count: alerts.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: alerts
  });
});

// @desc    Get single alert by ID
// @route   GET /api/alerts/:id
// @access  Public
exports.getAlertById = asyncHandler(async (req, res) => {
  const alert = await Alert.findById(req.params.id)
    .populate('author', 'username avatar profile.verified email')
    .populate('organization', 'name slug')
    .populate('confirmations.user', 'username avatar');

  if (!alert) {
    return res.status(404).json({
      success: false,
      error: 'Alert not found'
    });
  }

  // Increment view count
  alert.views += 1;
  await alert.save({ validateBeforeSave: false });

  res.json({
    success: true,
    data: alert
  });
});

// @desc    Create new alert
// @route   POST /api/alerts
// @access  Private
exports.createAlert = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    severity,
    location,
    tags,
    images,
    organization
  } = req.body;

  // Validation
  if (!title || !description || !category || !severity) {
    return res.status(400).json({
      success: false,
      error: 'Please provide title, description, category, and severity'
    });
  }

  // Create alert
  const alert = await Alert.create({
    title,
    description,
    category,
    severity,
    author: req.user._id,
    location,
    tags,
    images,
    organization,
    status: 'active', // Auto-activate for now (can add moderation later)
    verificationLevel: 'unverified'
  });

  // Populate response
  const populatedAlert = await Alert.findById(alert._id)
    .populate('author', 'username avatar profile.verified')
    .populate('organization', 'name slug');

  logger.info(`New alert created: ${alert._id} by ${req.user.username}`);

  res.status(201).json({
    success: true,
    message: 'Alert created successfully',
    data: populatedAlert
  });
});

// @desc    Update alert
// @route   PUT /api/alerts/:id
// @access  Private (Author or Admin)
exports.updateAlert = asyncHandler(async (req, res) => {
  let alert = await Alert.findById(req.params.id);

  if (!alert) {
    return res.status(404).json({
      success: false,
      error: 'Alert not found'
    });
  }

  // Check ownership or admin role
  if (alert.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this alert'
    });
  }

  // Update fields
  const allowedUpdates = ['title', 'description', 'location', 'tags', 'images', 'status'];
  const updates = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  alert = await Alert.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate('author', 'username avatar profile.verified');

  logger.info(`Alert updated: ${alert._id} by ${req.user.username}`);

  res.json({
    success: true,
    message: 'Alert updated successfully',
    data: alert
  });
});

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private (Author or Admin)
exports.deleteAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findById(req.params.id);

  if (!alert) {
    return res.status(404).json({
      success: false,
      error: 'Alert not found'
    });
  }

  // Check ownership or admin role
  if (alert.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this alert'
    });
  }

  await alert.deleteOne();

  logger.info(`Alert deleted: ${alert._id} by ${req.user.username}`);

  res.json({
    success: true,
    message: 'Alert removed successfully'
  });
});

// @desc    Confirm an alert (community verification)
// @route   POST /api/alerts/:id/confirm
// @access  Private
exports.confirmAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findById(req.params.id);

  if (!alert) {
    return res.status(404).json({
      success: false,
      error: 'Alert not found'
    });
  }

  try {
    await alert.addConfirmation(req.user._id);
    
    const updatedAlert = await Alert.findById(alert._id)
      .populate('author', 'username avatar profile.verified');

    logger.info(`Alert confirmed: ${alert._id} by ${req.user.username}`);

    res.json({
      success: true,
      message: 'Alert confirmed',
      data: updatedAlert
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Remove confirmation from alert
// @route   DELETE /api/alerts/:id/confirm
// @access  Private
exports.unconfirmAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findById(req.params.id);

  if (!alert) {
    return res.status(404).json({
      success: false,
      error: 'Alert not found'
    });
  }

  await alert.removeConfirmation(req.user._id);
  
  const updatedAlert = await Alert.findById(alert._id)
    .populate('author', 'username avatar profile.verified');

  logger.info(`Alert unconfirmed: ${alert._id} by ${req.user.username}`);

  res.json({
    success: true,
    message: 'Confirmation removed',
    data: updatedAlert
  });
});

// @desc    Verify alert (Moderator/Admin only)
// @route   PUT /api/alerts/:id/verify
// @access  Private (Admin/Moderator)
exports.verifyAlert = asyncHandler(async (req, res) => {
  // Check admin/moderator role
  if (!['admin', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to verify alerts'
    });
  }

  const { verificationLevel, reviewNotes } = req.body;

  if (!verificationLevel || !['community_verified', 'mod_verified', 'official'].includes(verificationLevel)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid verification level'
    });
  }

  const alert = await Alert.findByIdAndUpdate(
    req.params.id,
    {
      verificationLevel,
      reviewedBy: req.user._id,
      reviewedAt: Date.now(),
      reviewNotes
    },
    { new: true, runValidators: true }
  ).populate('author', 'username avatar profile.verified')
   .populate('reviewedBy', 'username');

  if (!alert) {
    return res.status(404).json({
      success: false,
      error: 'Alert not found'
    });
  }

  logger.info(`Alert verified: ${alert._id} by ${req.user.username} as ${verificationLevel}`);

  res.json({
    success: true,
    message: `Alert verified as ${verificationLevel}`,
    data: alert
  });
});

// @desc    Get alert statistics
// @route   GET /api/alerts/stats
// @access  Public
exports.getAlertStats = asyncHandler(async (req, res) => {
  const stats = await Alert.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgViews: { $avg: '$views' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const severityStats = await Alert.aggregate([
    {
      $group: {
        _id: '$severity',
        count: { $sum: 1 }
      }
    }
  ]);

  const verificationStats = await Alert.aggregate([
    {
      $group: {
        _id: '$verificationLevel',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      byCategory: stats,
      bySeverity: severityStats,
      byVerification: verificationStats
    }
  });
});
