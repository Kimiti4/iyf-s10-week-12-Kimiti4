/**
 * 🔹 Posts Controller - Unified for Mtaani/Skills/Farm/Gigs
 * Handles CRUD + filtering + validation + nested comments
 * Uses MongoDB with Mongoose models
 */
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

// GET all posts with advanced filtering
const getAllPosts = asyncHandler(async (req, res) => {
  const {
    category, location, county, settlement, zone,
    search, author, tag,
    sort = 'newest', page = 1, limit = 10,
    minPrice, maxPrice, crop, skill,
    organization
  } = req.query;

  // Build filter object
  let filter = { published: true };

  // Category filter (core unification)
  if (category) {
    filter.category = category;
  }

  // Organization filter (multi-tenant support)
  if (organization) {
    filter.organization = organization;
  }

  // Location filters (geo-unification)
  if (county) {
    filter['location.county'] = { $regex: new RegExp(county, 'i') };
  }
  if (settlement) {
    filter['location.settlement'] = { $regex: new RegExp(settlement, 'i') };
  }
  if (zone) {
    filter['location.zone'] = { $regex: new RegExp(zone, 'i') };
  }

  // Search across title/content/tags using text index
  if (search) {
    filter.$text = { $search: search };
  }

  // Author filter
  if (author) {
    filter.author = author;
  }

  // Tag filter
  if (tag) {
    filter.tags = { $in: [tag.toLowerCase()] };
  }

  // Domain-specific filters
  if (crop) {
    filter['metadata.crop'] = { $regex: new RegExp(crop, 'i') };
  }
  if (skill) {
    filter.$or = [
      { 'metadata.offeredSkill': { $regex: new RegExp(skill, 'i') } },
      { 'metadata.requestedSkill': { $regex: new RegExp(skill, 'i') } }
    ];
  }
  if (minPrice || maxPrice) {
    filter['metadata.pricePerUnit'] = {};
    if (minPrice) filter['metadata.pricePerUnit'].$gte = parseFloat(minPrice);
    if (maxPrice) filter['metadata.pricePerUnit'].$lte = parseFloat(maxPrice);
  }

  // Sorting
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    popular: { likes: -1 },
    urgent: { 'metadata.urgency': -1, upvotes: -1 }
  };

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const result = await Post.find(filter)
    .sort(sortOptions[sort] || sortOptions.newest)
    .skip(skip)
    .limit(limitNum)
    .populate('author', 'username profile.location profile.avatar')
    .populate('organization', 'name slug type');

  // Get total count for pagination
  const total = await Post.countDocuments(filter);

  res.json({
    success: true,
    data: result,
    count: result.length,
    total,
    page: pageNum,
    limit: limitNum,
    filters: { category, location, county, search, sort }
  });
});

// GET single post
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username email profile.location profile.avatar')
    .populate('organization', 'name slug type')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'username profile.avatar'
      }
    });

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  // Increment view count
  post.views += 1;
  await post.save();

  res.json({ success: true, data: post });
});

// POST create new post (with validation)
const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, location, tags, metadata, organization } = req.body;

  // Validation
  if (!title || title.trim().length < 3) {
    throw new ApiError('Title must be at least 3 characters', 400);
  }
  if (!content || content.trim().length < 10) {
    throw new ApiError('Content must be at least 10 characters', 400);
  }
  if (!category || !['mtaani', 'skill', 'farm', 'gig', 'alert'].includes(category)) {
    throw new ApiError('Valid category required: mtaani|skill|farm|gig|alert', 400);
  }

  // Create post with authenticated user as author
  const postData = {
    title: title.trim(),
    content: content.trim(),
    author: req.user._id,  // Use authenticated user
    category,
    location: location || { county: 'Unknown' },
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
    metadata: metadata || {},
    published: true
  };

  // Add organization if provided
  if (organization) {
    postData.organization = organization;
  }

  // Add category-specific defaults
  if (category === 'farm' && !postData.metadata.pricePerUnit) {
    postData.metadata.pricePerUnit = 0; // Farmer to fill
  }
  if (category === 'skill' && !postData.metadata.offeredHours) {
    postData.metadata.offeredHours = 1; // Default 1 hour
  }

  const newPost = await Post.create(postData);

  // Populate author and organization info for response
  const populatedPost = await Post.findById(newPost._id)
    .populate('author', 'username profile.location profile.avatar')
    .populate('organization', 'name slug type');

  res.status(201).json({ success: true, data: populatedPost });
});

// PUT update post
const updatePost = asyncHandler(async (req, res) => {
  const { title, content, metadata } = req.body;

  // Find post and check ownership
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  // Check if user owns this post or is admin
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError('You can only modify your own content', 403);
  }

  // Update fields
  if (title !== undefined) post.title = title.trim();
  if (content !== undefined) post.content = content.trim();
  if (metadata !== undefined) post.metadata = { ...post.metadata, ...metadata };

  const updatedPost = await post.save();

  // Populate for response
  const populatedPost = await Post.findById(updatedPost._id)
    .populate('author', 'username profile.location profile.avatar')
    .populate('organization', 'name slug type');

  res.json({ success: true, data: populatedPost });
});

// DELETE post
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  // Check if user owns this post or is admin
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError('You can only delete your own content', 403);
  }

  // Delete associated comments
  await Comment.deleteMany({ post: post._id });

  // Delete the post
  await post.deleteOne();

  res.status(204).send();
});

// PATCH like/upvote post
const engagePost = asyncHandler(async (req, res) => {
  const { type = 'like' } = req.query; // like or upvote
  
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  if (type === 'upvote' && post.metadata?.urgency) {
    post.upvotes += 1;
  } else {
    post.likes += 1;
  }

  await post.save();

  res.json({ success: true, data: post });
});

// GET comments for a post
const getComments = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  const comments = await Comment.find({ post: post._id })
    .populate('author', 'username profile.avatar')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    postId: post._id,
    count: comments.length,
    data: comments
  });
});

// POST new comment
const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;

  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new ApiError('Post not found', 404);
  }
  if (!content || content.trim().length < 1) {
    throw new ApiError('Comment content is required', 400);
  }

  // Create comment with authenticated user
  const newComment = await Comment.create({
    content: content.trim(),
    author: req.user._id,
    post: post._id
  });

  // Add comment to post's comments array
  post.comments.push(newComment._id);
  await post.save();

  // Populate author for response
  const populatedComment = await Comment.findById(newComment._id)
    .populate('author', 'username profile.avatar');

  res.status(201).json({ success: true, data: populatedComment });
});

// DELETE comment
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    throw new ApiError('Comment not found', 404);
  }

  // Check if user owns this comment or is admin
  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError('You can only delete your own comments', 403);
  }

  // Remove from post's comments array
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: comment._id }
  });

  // Delete the comment
  await comment.deleteOne();

  res.status(204).send();
});

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  engagePost,
  getComments,
  addComment,
  deleteComment
};
