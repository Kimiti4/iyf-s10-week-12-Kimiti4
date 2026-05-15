/**
 * 🔹 Alert Model
 * Realtime verified community alerts with multi-level verification
 */

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Alert description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Alert Category (from alerts.md)
  category: {
    type: String,
    required: true,
    enum: {
      values: [
        'emergency',
        'security',
        'scam_warning',
        'lost_found',
        'traffic_transport',
        'event',
        'utility_outage',
        'campus_notice',
        'marketplace_fraud',
        'weather'
      ],
      message: 'Invalid alert category'
    }
  },
  
  // Severity Level
  severity: {
    type: String,
    required: true,
    enum: {
      values: ['info', 'warning', 'critical', 'official'],
      message: 'Invalid severity level'
    },
    default: 'info'
  },
  
  // Verification System (4 levels from alerts.md)
  verificationLevel: {
    type: String,
    enum: {
      values: ['unverified', 'community_verified', 'mod_verified', 'official'],
      message: 'Invalid verification level'
    },
    default: 'unverified'
  },
  
  // Author Information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Organization/Community Context
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: false
  },
  
  // Location Information
  location: {
    address: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    },
    radius: {
      type: Number,
      default: 5000, // 5km default radius
      min: 100,
      max: 50000
    }
  },
  
  // Community Confirmation System
  confirmations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  confirmationCount: {
    type: Number,
    default: 0
  },
  
  // Moderator/Admin Actions
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  reviewedAt: Date,
  
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Status
  status: {
    type: String,
    enum: {
      values: ['pending', 'active', 'resolved', 'expired', 'rejected'],
      message: 'Invalid alert status'
    },
    default: 'pending'
  },
  
  // Expiration
  expiresAt: {
    type: Date,
    index: true
  },
  
  // Metadata
  views: {
    type: Number,
    default: 0
  },
  
  shares: {
    type: Number,
    default: 0
  },
  
  // Images/Media (optional)
  images: [{
    url: String,
    caption: String
  }],
  
  // Tags for better search/filtering
  tags: [{
    type: String,
    trim: true
  }],
  
  // AI Analysis (Tiannara integration - future)
  aiAnalysis: {
    credible: Boolean,
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    spamProbability: {
      type: Number,
      min: 0,
      max: 1
    },
    analyzedAt: Date
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
alertSchema.index({ category: 1, status: 1 });
alertSchema.index({ severity: 1, status: 1 });
alertSchema.index({ verificationLevel: 1 });
alertSchema.index({ 'location.coordinates': '2dsphere' }); // Geo-spatial index
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-expire
alertSchema.index({ createdAt: -1 }); // Sort by newest

// Virtual for checking if alert is expired
alertSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Virtual for checking if community verified (5+ confirmations)
alertSchema.virtual('isCommunityVerified').get(function() {
  return this.confirmationCount >= 5;
});

// Method to add confirmation
alertSchema.methods.addConfirmation = function(userId) {
  // Check if user already confirmed
  const existingConfirmation = this.confirmations.find(
    conf => conf.user.toString() === userId.toString()
  );
  
  if (existingConfirmation) {
    throw new Error('User has already confirmed this alert');
  }
  
  this.confirmations.push({ user: userId });
  this.confirmationCount = this.confirmations.length;
  
  // Auto-upgrade to community verified if 5+ confirmations
  if (this.confirmationCount >= 5 && this.verificationLevel === 'unverified') {
    this.verificationLevel = 'community_verified';
  }
  
  return this.save();
};

// Method to remove confirmation
alertSchema.methods.removeConfirmation = function(userId) {
  this.confirmations = this.confirmations.filter(
    conf => conf.user.toString() !== userId.toString()
  );
  this.confirmationCount = this.confirmations.length;
  
  // Downgrade if below threshold
  if (this.confirmationCount < 5 && this.verificationLevel === 'community_verified') {
    this.verificationLevel = 'unverified';
  }
  
  return this.save();
};

// Static method to get active alerts by category
alertSchema.statics.getActiveAlerts = function(category, options = {}) {
  const query = {
    status: 'active',
    ...(category && category !== 'all' && { category })
  };
  
  // Filter by verification level if specified
  if (options.minVerificationLevel) {
    const levels = ['unverified', 'community_verified', 'mod_verified', 'official'];
    const minIndex = levels.indexOf(options.minVerificationLevel);
    query.verificationLevel = { $in: levels.slice(minIndex) };
  }
  
  return this.find(query)
    .populate('author', 'username avatar profile.verified')
    .populate('organization', 'name slug')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Pre-save middleware to set default expiration
alertSchema.pre('save', function(next) {
  // Set default expiration based on severity
  if (!this.expiresAt) {
    const now = new Date();
    switch (this.severity) {
      case 'critical':
        now.setHours(now.getHours() + 24); // 24 hours
        break;
      case 'warning':
        now.setHours(now.getHours() + 48); // 48 hours
        break;
      case 'info':
      default:
        now.setDate(now.getDate() + 7); // 7 days
        break;
    }
    this.expiresAt = now;
  }
  
  next();
});

module.exports = mongoose.model('Alert', alertSchema);
