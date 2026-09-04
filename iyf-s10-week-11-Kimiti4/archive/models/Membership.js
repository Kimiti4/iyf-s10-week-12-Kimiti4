/**
 * 🔹 Membership Model - User Roles within Organizations
 * Manages user membership and permissions in organizations
 */
const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  // Organization reference
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Role within organization
  role: {
    type: String,
    enum: ['owner', 'admin', 'moderator', 'member'],
    default: 'member',
    index: true
  },
  
  // Permissions (override default role permissions)
  permissions: {
    canPost: { type: Boolean, default: true },
    canComment: { type: Boolean, default: true },
    canModerate: { type: Boolean, default: false },
    canManageMembers: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canManageBilling: { type: Boolean, default: false }
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'pending', 'suspended', 'banned'],
    default: 'active',
    index: true
  },
  
  // Join approval
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  
  // Activity tracking
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  
  // Notes (for admins)
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔍 Compound unique index: One membership per user per organization
membershipSchema.index({ organization: 1, user: 1 }, { unique: true });

// 🔍 Index for finding user's memberships
membershipSchema.index({ user: 1, status: 1 });

// 🔍 Index for finding organization members
membershipSchema.index({ organization: 1, role: 1, status: 1 });

// 🔢 Instance method: Check if has permission
membershipSchema.methods.hasPermission = function(permission) {
  // If explicitly set, use that
  if (this.permissions[permission] !== undefined) {
    return this.permissions[permission];
  }
  
  // Otherwise, use role-based defaults
  const rolePermissions = {
    owner: {
      canPost: true,
      canComment: true,
      canModerate: true,
      canManageMembers: true,
      canManageSettings: true,
      canViewAnalytics: true,
      canManageBilling: true
    },
    admin: {
      canPost: true,
      canComment: true,
      canModerate: true,
      canManageMembers: true,
      canManageSettings: true,
      canViewAnalytics: true,
      canManageBilling: false
    },
    moderator: {
      canPost: true,
      canComment: true,
      canModerate: true,
      canManageMembers: false,
      canManageSettings: false,
      canViewAnalytics: false,
      canManageBilling: false
    },
    member: {
      canPost: true,
      canComment: true,
      canModerate: false,
      canManageMembers: false,
      canManageSettings: false,
      canViewAnalytics: false,
      canManageBilling: false
    }
  };
  
  return rolePermissions[this.role]?.[permission] || false;
};

// 🔢 Instance method: Update last active timestamp
membershipSchema.methods.updateLastActive = function() {
  this.lastActiveAt = new Date();
  return this.save();
};

// 🔍 Static method: Find user's membership in organization
membershipSchema.statics.findByUserAndOrg = function(userId, orgId) {
  return this.findOne({
    user: userId,
    organization: orgId,
    status: 'active'
  }).populate('organization', 'name slug type branding');
};

// 🔍 Static method: Find all members of an organization
membershipSchema.statics.findMembers = function(orgId, options = {}) {
  const { role, status = 'active', page = 1, limit = 50 } = options;
  
  let filter = { organization: orgId, status };
  if (role) filter.role = role;
  
  const skip = (page - 1) * limit;
  
  return this.find(filter)
    .sort({ joinedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'username profile.avatar profile.location email');
};

// 🔍 Static method: Count members by role
membershipSchema.statics.countByRole = function(orgId) {
  return this.aggregate([
    { $match: { organization: mongoose.Types.ObjectId(orgId), status: 'active' } },
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);
};

// 🔢 Pre-save: Set default permissions based on role
membershipSchema.pre('save', function(next) {
  // Only set defaults on new documents or when role changes
  if (this.isNew || this.isModified('role')) {
    const roleDefaults = {
      owner: {
        canPost: true,
        canComment: true,
        canModerate: true,
        canManageMembers: true,
        canManageSettings: true,
        canViewAnalytics: true,
        canManageBilling: true
      },
      admin: {
        canPost: true,
        canComment: true,
        canModerate: true,
        canManageMembers: true,
        canManageSettings: true,
        canViewAnalytics: true,
        canManageBilling: false
      },
      moderator: {
        canPost: true,
        canComment: true,
        canModerate: true,
        canManageMembers: false,
        canManageSettings: false,
        canViewAnalytics: false,
        canManageBilling: false
      },
      member: {
        canPost: true,
        canComment: true,
        canModerate: false,
        canManageMembers: false,
        canManageSettings: false,
        canViewAnalytics: false,
        canManageBilling: false
      }
    };
    
    // Merge role defaults with any custom permissions
    this.permissions = {
      ...roleDefaults[this.role],
      ...this.permissions
    };
  }
  next();
});

module.exports = mongoose.model('Membership', membershipSchema);
