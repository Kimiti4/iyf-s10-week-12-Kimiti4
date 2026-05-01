/**
 * 🔹 Post Model - Jamii Link KE Unified Schema
 * Supports: mtaani, skill, farm, gig, alert categories
 */
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // Core content
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters'],
    index: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [10, 'Content must be at least 10 characters'],
    index: true  // For text search
  },
  
  // Author (linked to User)
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
    index: true
  },
  
  // Category (unified platform)
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['mtaani', 'skill', 'farm', 'gig', 'alert'],
    index: true
  },
  
  // Location (geo-filtering for Kenya)
  location: {
    county: { type: String, index: true },
    settlement: { type: String, index: true },
    ward: String,
    zone: String,
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number]  // [longitude, latitude]
    }
  },
  
  // Category-specific metadata (flexible schema)
  metadata: {
    // Farm: crop, price, quantity
    crop: String,
    variety: String,
    pricePerUnit: Number,
    unit: { type: String, enum: ['kg', 'piece', 'liter', 'bundle'], default: 'kg' },
    quantity: Number,
    harvestDate: Date,
    organic: Boolean,
    
    // Skill: offered/requested skills
    offeredSkill: String,
    requestedSkill: String,
    offeredHours: Number,
    
    // Gig: job details
    gigType: String,
    budget: Number,
    currency: { type: String, default: 'KES' },
    deadline: Date,
    
    // Mtaani/Alert: urgency
    urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    affectedCount: Number
  },
  
  // Engagement
  likes: { type: Number, default: 0, index: true },
  upvotes: { type: Number, default: 0 },  // For urgent alerts
  views: { type: Number, default: 0 },
  
  // Tags for discovery
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    index: true
  }],
  
  // Status
  published: { type: Boolean, default: true },
  flagged: { type: Boolean, default: false },  // For moderation
  
  // Relationships
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 🔍 Text index for search across title/content/tags
postSchema.index({ title: 'text', content: 'text', tags: 'text' });

// 🌍 Geospatial index for location-based queries
postSchema.index({ 'location.coordinates': '2dsphere' });

// 🔢 Instance method: Like a post
postSchema.methods.like = function() {
  this.likes += 1;
  return this.save();
};

// 🔢 Instance method: Upvote (for alerts)
postSchema.methods.upvote = function() {
  this.upvotes += 1;
  return this.save();
};

// 🔍 Static method: Search posts
postSchema.statics.search = function(query, options = {}) {
  const { category, location, author, sort = 'newest', page = 1, limit = 10 } = options;
  
  let filter = { published: true };
  
  if (category) filter.category = category;
  if (location?.county) filter['location.county'] = location.county;
  if (author) filter.author = author;
  
  if (query) {
    filter.$text = { $search: query };
  }
  
  // Sorting
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    popular: { likes: -1 },
    urgent: { 'metadata.urgency': -1, upvotes: -1 }
  };
  
  const skip = (page - 1) * limit;
  
  return this.find(filter)
    .sort(sortOptions[sort] || sortOptions.newest)
    .skip(skip)
    .limit(limit)
    .populate('author', 'username profile.location');
};

module.exports = mongoose.model('Post', postSchema);
