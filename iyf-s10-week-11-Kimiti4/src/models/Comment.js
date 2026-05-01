/**
 * 🔹 Comment Model
 * Nested under posts with author reference
 */
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  // Optional: nested replies
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Populate author info by default
commentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'username profile.avatar'
  });
  next();
});

module.exports = mongoose.model('Comment', commentSchema);
