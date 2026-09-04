/**
 * 🔹 Organization Model - Multi-Tenant Architecture
 * Represents communities, schools, estates, churches, SMEs, etc.
 */
const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  // Unique slug for URL (e.g., strathmore.jamiilink.com)
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be alphanumeric with hyphens'],
    index: true
  },
  
  // Organization Type
  type: {
    type: String,
    required: true,
    enum: [
      'school',
      'university',
      'estate',
      'church',
      'ngo',
      'sme',
      'coworking',
      'community',
      'youth_group',
      'professional'
    ],
    index: true
  },
  
  // Description
  description: {
    type: String,
    maxlength: 1000
  },
  
  // Branding
  branding: {
    logo: String,  // URL to logo
    primaryColor: { type: String, default: '#3b82f6' },
    secondaryColor: { type: String, default: '#8b5cf6' },
    bannerImage: String
  },
  
  // Contact Information
  contact: {
    email: { type: String, lowercase: true, trim: true },
    phone: String,
    website: String,
    address: {
      street: String,
      city: String,
      county: String,
      country: { type: String, default: 'Kenya' }
    }
  },
  
  // Subscription Plan
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free',
    index: true
  },
  
  // 🔹 Verification System (Unique to JamiiLink)
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verificationType: {
      type: String,
      enum: ['official_document', 'government_registration', 'educational_institution', 'business_license', 'manual'],
      default: 'manual'
    },
    badgeLevel: {
      type: String,
      enum: ['verified', 'premium', 'partner', 'official'],
      default: 'verified'
    },
    badgeIcon: { type: String, default: '✓' },  // Default checkmark
    badgeColor: { type: String, default: '#3b82f6' },  // Blue for verified
    badgeGradient: {  // Unique gradient badges
      start: { type: String, default: '#3b82f6' },
      end: { type: String, default: '#8b5cf6' }
    },
    verificationNotes: String,
    documents: [{
      type: {
        type: String,
        enum: ['registration_certificate', 'license', 'letterhead', 'id', 'other']
      },
      url: String,
      uploadedAt: Date,
      verified: Boolean,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verifiedAt: Date
    }],
    expiresAt: Date  // For temporary verifications
  },
  
  // Subscription Details
  subscription: {
    status: {
      type: String,
      enum: ['active', 'trialing', 'past_due', 'cancelled', 'expired'],
      default: 'active'
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: { type: Boolean, default: false },
    stripeCustomerId: String,  // For Stripe integration
    stripeSubscriptionId: String
  },
  
  // Settings
  settings: {
    allowPublicJoin: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: true },
    enableMarketplace: { type: Boolean, default: true },
    enableEvents: { type: Boolean, default: true },
    enableMessaging: { type: Boolean, default: true },
    enableReels: { type: Boolean, default: true },
    maxMembers: { type: Number, default: 100 },  // Plan-based limit
    storageLimitMB: { type: Number, default: 500 }  // Plan-based limit
  },
  
  // Moderation
  moderation: {
    autoApprovePosts: { type: Boolean, default: false },
    blockedWords: [String],
    reportThreshold: { type: Number, default: 3 }  // Auto-hide after X reports
  },
  
  // Statistics (cached for performance)
  stats: {
    memberCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
    activeMembersLast7Days: { type: Number, default: 0 },
    activeMembersLast30Days: { type: Number, default: 0 }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'archived'],
    default: 'active',
    index: true
  },
  
  // Creator/Owner
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Admins (quick reference)
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔍 Indexes for performance
organizationSchema.index({ type: 1, status: 1 });
organizationSchema.index({ 'contact.county': 1 });
organizationSchema.index({ createdAt: -1 });

// 🔍 Virtual: Organization URL
organizationSchema.virtual('url').get(function() {
  return `/${this.slug}`;
});

// 🔍 Virtual: Full domain URL (for custom domains in future)
organizationSchema.virtual('domain').get(function() {
  return `${this.slug}.jamiilink.com`;
});

// 🔢 Instance method: Check if user is admin
organizationSchema.methods.isAdmin = function(userId) {
  return this.admins.some(adminId => adminId.toString() === userId.toString()) ||
         this.owner.toString() === userId.toString();
};

// 🔢 Instance method: Check if user is owner
organizationSchema.methods.isOwner = function(userId) {
  return this.owner.toString() === userId.toString();
};

// 🔢 Instance method: Increment member count
organizationSchema.methods.incrementMemberCount = function() {
  this.stats.memberCount += 1;
  return this.save();
};

// 🔢 Instance method: Decrement member count
organizationSchema.methods.decrementMemberCount = function() {
  if (this.stats.memberCount > 0) {
    this.stats.memberCount -= 1;
  }
  return this.save();
};

// 🔢 Instance method: Increment post count
organizationSchema.methods.incrementPostCount = function() {
  this.stats.postCount += 1;
  return this.save();
};

// 🔍 Static method: Find by slug
organizationSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, status: 'active' });
};

// 🔍 Static method: Search organizations
organizationSchema.statics.search = function(query, options = {}) {
  const { type, county, page = 1, limit = 10 } = options;
  
  let filter = { status: 'active' };
  
  if (type) filter.type = type;
  if (county) filter['contact.county'] = county;
  
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ];
  }
  
  const skip = (page - 1) * limit;
  
  return this.find(filter)
    .sort({ 'stats.memberCount': -1 })
    .skip(skip)
    .limit(limit)
    .populate('owner', 'username profile.avatar');
};

// 🔢 Pre-save: Generate slug from name if not provided
organizationSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

module.exports = mongoose.model('Organization', organizationSchema);
