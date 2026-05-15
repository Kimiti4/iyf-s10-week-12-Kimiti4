/**
 * 🔹 Alert Model
 * Schema for community alerts system
 */

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  // Alert content
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Alert classification
  category: {
    type: String,
    required: true,
    enum: [
      'emergency',
      'security',
      'scam_warning',
      'lost_found',
      'traffic_transport',
      'event',
      'utility_outage',
      'campus_notice',
      'marketplace_fraud',
      'weather',
      'other'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Location information
  location: {
    type: String,
    trim: true,
    maxlength: [300, 'Location cannot exceed 300 characters']
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && 
                 v[1] >= -90 && v[1] <= 90;
        },
        message: 'Invalid coordinates'
      }
    }
  },
  
  // Media
  images: [{
    url: String,
    publicId: String
  }],
  
  // Tags for searchability
  tags: [{
    type: String,
    trim: true
  }],
  
  // Author and organization
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  
  // Status and verification
  status: {
    type: String,
    enum: ['active', 'resolved', 'expired', 'archived'],
    default: 'active'
  },
  verificationLevel: {
    type: String,
    enum: ['unverified', 'community_verified', 'mod_verified', 'official'],
    default: 'unverified'
  },
  
  // Community confirmations
  confirmations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    confirmedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Review information (for moderators)
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,
  
  // Statistics
  views: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
alertSchema.index({ coordinates: '2dsphere' });

// Index for searching
alertSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Index for filtering
alertSchema.index({ category: 1, severity: 1, status: 1, createdAt: -1 });

// Virtual for confirmation count
alertSchema.virtual('confirmationCount').get(function() {
  return this.confirmations.length;
});

// Method to add confirmation
alertSchema.methods.addConfirmation = async function(userId) {
  const alreadyConfirmed = this.confirmations.some(
    c => c.user.toString() === userId.toString()
  );
  
  if (alreadyConfirmed) {
    throw new Error('You have already confirmed this alert');
  }
  
  this.confirmations.push({ user: userId });
  
  // Auto-verify if enough confirmations
  if (this.confirmations.length >= 5 && this.verificationLevel === 'unverified') {
    this.verificationLevel = 'community_verified';
  }
  
  await this.save();
  return this;
};

// Method to remove confirmation
alertSchema.methods.removeConfirmation = async function(userId) {
  this.confirmations = this.confirmations.filter(
    c => c.user.toString() !== userId.toString()
  );
  
  // Downgrade verification if needed
  if (this.verificationLevel === 'community_verified' && this.confirmations.length < 5) {
    this.verificationLevel = 'unverified';
  }
  
  await this.save();
  return this;
};

module.exports = mongoose.model('Alert', alertSchema);
