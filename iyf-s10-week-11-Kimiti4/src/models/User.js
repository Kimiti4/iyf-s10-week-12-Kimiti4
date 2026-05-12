/**
 * 🔹 User Model with Authentication
 * Handles registration, login, password hashing
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false  // Never return password in queries
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  
  // 🔹 Verification System (Unique to JamiiLink)
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Admin who verified
    verificationType: {
      type: String,
      enum: ['manual', 'document', 'email', 'phone', 'social', 'organization_admin'],
      default: 'manual'
    },
    badgeLevel: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze'
    },
    badgeColor: { type: String, default: '#CD7F32' },  // Bronze color
    verificationNotes: String,  // Internal notes about verification
    expiresAt: Date,  // Optional: verification expiry for temporary badges
    documents: [{  // Uploaded verification documents
      type: String,
      url: String,
      uploadedAt: Date,
      verified: Boolean
    }]
  },
  
  // Organization memberships
  organizations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  }],
  
  // Current/active organization context
  currentOrganization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  profile: {
    bio: { type: String, maxlength: 500 },
    location: {
      county: String,
      settlement: String,
      ward: String
    },
    skills: [String],
    avatar: String  // URL to profile image
  }
}, {
  timestamps: true,  // Adds createdAt, updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔐 Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash if password is new or modified
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 🔑 Compare password method for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 🔍 Virtual: User's posts (for population)
userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author'
});

// 🔍 Virtual: User's comments
userSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'author'
});

module.exports = mongoose.model('User', userSchema);
