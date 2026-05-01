/**
 * 🔹 Posts Controller - MongoDB Version
 * Full CRUD with filtering, pagination, authorization
 */
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

/**
 * GET all posts with advanced filtering
 */
const getAllPosts = asyncHandler(async (req, res) => {
  const {
    category, county, settlement, search, author, tag,
    sort = 'newest', page = 1, limit = 10,
    minPrice, maxPrice, crop
  } = req.query;
  
  // Build query
  let query = { published: true };
  
  if (category) query.category = category;
  if (county) query['location.county'] = county;
  if (settlement) query['location.settlement'] = settlement;
  if (author) query.author = author;
  if (crop) query['metadata.crop'] = crop;
  
  // Text search
  if (search) {
    query.$text = { $search: search };
  }
  
  // Tag filter
  if (tag) {
    query.tags = tag.toLowerCase();
  }
  
  // Price range (for farm posts)
  if (minPrice || maxPrice) {
    query['metadata.pricePerUnit'] = {};
    if (minPrice) query['metadata.pricePerUnit'].$gte = parseFloat(minPrice);
    if (maxPrice) query['metadata.pricePerUnit'].$lte = parseFloat(maxPrice);
  }
  
  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  
  // Sorting
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    popular: { likes: -1 },
    urgent: { 'metadata.urgency': -1, upvotes: -1 }
  };
  
  // Execute query
  const posts = await Post.find(query)
    .populate('author', 'username profile.location')
    .sort(sortOptions[sort] || sortOptions.newest)
    .skip(skip)
    .limit(limitNum);
  
  const total = await Post.countDocuments(query);
  
  res.json({
    success: true,
    count: posts.length,
    total,
    page: pageNum,
    limit: limitNum,
    pages: Math.ceil(total / limitNum),
    filters: { category, county, search, sort },
    data: posts
  });
});

/**
 * GET single post by ID
 */
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username email profile')
    .populate({
      path: 'comments',
      populate: { path: 'author', select: 'username profile.avatar' },
      options: { sort: { createdAt: -1 }, limit: 20 }
    });
  
  if (!post) {
    throw new ApiError('Post not found', 404);
  }
  
  // Increment view count
  post.views = (post.views || 0) + 1;
  await post.save();
  
  res.json({ success: true, data: post });
});

/**
 * CREATE new post (protected)
 */
const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, location, tags, metadata } = req.body;
  
  const post = await Post.create({
    title,
    content,
    author: req.user._id,  // From auth middleware
    category,
    location: location || {},
    tags: tags || [],
    metadata: metadata || {}
  });
  
  // Populate author for response
  await post.populate('author', 'username profile.location');
  
  res.status(201).json({ success: true, data: post });
});

/**
 * UPDATE post (owner or admin only)
 */
const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    throw new ApiError('Post not found', 404);
  }
  
  // Authorization: owner or admin
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError('You can only edit your own posts', 403);
  }
  
  const { title, content, metadata, tags } = req.body;
  
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      title: title || post.title,
      content: content || post.content,
      metadata: metadata ? { ...post.metadata, ...metadata } : post.metadata,
      tags: tags || post.tags
    },
    { new: true, runValidators: true }
  ).populate('author', 'username profile.location');
  
  res.json({ success: true, data: updatedPost });
});

/**
 * DELETE post (owner or admin only)
 */
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    throw new ApiError('Post not found', 404);
  }
  
  // Authorization
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError('You can only delete your own posts', 403);
  }
  
  // Delete associated comments
  await Comment.deleteMany({ post: post._id });
  
  await post.deleteOne();
  
  res.status(204).send();
});

/**
 * LIKE/UPVOTE post
 */
const engagePost = asyncHandler(async (req, res) => {
  const { type = 'like' } = req.query;
  const post = await Post.findById(req.params.id);
  
  if (!post) {
    throw new ApiError('Post not found', 404);
  }
  
  if (type === 'upvote' && post.metadata?.urgency) {
    post.upvotes = (post.upvotes || 0) + 1;
  } else {
    post.likes = (post.likes || 0) + 1;
  }
  
  await post.save();
  
  res.json({ success: true, data: post });
});

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  engagePost
};
