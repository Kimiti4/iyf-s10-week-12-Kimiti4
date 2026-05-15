/**
 * 🔹 Posts Controller - PostgreSQL Version
 * Handles CRUD + filtering for Mtaani/Skills/Farm/Gigs
 * Integrated with Tiannara AI for content moderation
 */
const { PostRepository } = require('../database');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const tiannaraService = require('../services/tiannaraService');

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
  const filters = {
    category,
    organizationId: organization,
    county,
    settlement,
    authorId: author,
    search,
    sort,
    page: parseInt(page),
    limit: parseInt(limit)
  };

  // Execute query
  const result = await PostRepository.find(filters);

  res.json({
    success: true,
    count: result.posts.length,
    total: result.pagination.total,
    pages: result.pagination.pages,
    currentPage: result.pagination.page,
    data: result.posts
  });
});

// GET single post by ID
const getPostById = asyncHandler(async (req, res) => {
  const post = await PostRepository.findById(req.params.id);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  // Increment views
  await PostRepository.incrementViews(req.params.id);

  res.json({
    success: true,
    data: post
  });
});

// CREATE new post with AI moderation
const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, location, metadata, tags, organization } = req.body;

  // Validate required fields
  if (!title || !content || !category) {
    throw new ApiError('Title, content, and category are required', 400);
  }

  // 🔹 STEP 1: Moderate content BEFORE saving (Tiannara integration)
  let moderationResult = null;
  try {
    moderationResult = await tiannaraService.moderateContent(content);
  } catch (error) {
    console.warn('Tiannara moderation failed, proceeding without moderation:', error.message);
    // Fallback: allow content but mark as unchecked
    moderationResult = {
      safe: true,
      toxicity_score: 0,
      spam_probability: 0,
      scam_probability: 0,
      categories_flagged: [],
      confidence: 0,
      explanation: 'Moderation service unavailable'
    };
  }

  // 🔹 STEP 2: Check if content is safe
  if (!tiannaraService.isContentSafe(moderationResult)) {
    return res.status(400).json({
      success: false,
      message: 'Content violates community guidelines',
      reason: tiannaraService.getFlagReason(moderationResult),
      details: {
        toxicity: moderationResult.toxicity_score,
        spam: moderationResult.spam_probability,
        scam: moderationResult.scam_probability
      }
    });
  }

  // 🔹 STEP 3: Content is safe, proceed with creation
  const postData = {
    title,
    content,
    authorId: req.user.id,
    organizationId: organization || null,
    category,
    location: location || {},
    metadata: metadata || {},
    tags: tags || []
  };

  const post = await PostRepository.create(postData);

  // Store moderation metadata
  await PostRepository.update(post.id, {
    moderationChecked: true,
    moderationTimestamp: new Date(),
    moderationToxicityScore: moderationResult.toxicity_score,
    moderationSpamScore: moderationResult.spam_probability,
    moderationScamScore: moderationResult.scam_probability,
    moderationFlagged: !moderationResult.safe,
    moderationCategories: moderationResult.categories_flagged
  });

  res.status(201).json({
    success: true,
    data: post,
    moderation: {
      checked: true,
      safe: moderationResult.safe,
      scores: moderationResult.scores
    }
  });
});

// UPDATE post
const updatePost = asyncHandler(async (req, res) => {
  const post = await PostRepository.findById(req.params.id);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  // Check authorization (only author can update)
  if (post.author.id !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError('Not authorized to update this post', 403);
  }

  const allowedFields = ['title', 'content', 'location', 'metadata', 'tags'];
  const updates = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const updatedPost = await PostRepository.update(req.params.id, updates);

  res.json({
    success: true,
    data: updatedPost
  });
});

// DELETE post
const deletePost = asyncHandler(async (req, res) => {
  const post = await PostRepository.findById(req.params.id);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  // Check authorization (author or admin only)
  if (post.author.id !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError('Not authorized to delete this post', 403);
  }

  await PostRepository.delete(req.params.id);

  res.json({
    success: true,
    message: 'Post deleted successfully'
  });
});

// LIKE post
const likePost = asyncHandler(async (req, res) => {
  const post = await PostRepository.like(req.params.id);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  res.json({
    success: true,
    data: post
  });
});

// UPVOTE post (for alerts)
const upvotePost = asyncHandler(async (req, res) => {
  const post = await PostRepository.upvote(req.params.id);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  res.json({
    success: true,
    data: post
  });
});

// GET user's posts
const getUserPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;

  const result = await PostRepository.find({
    authorId: req.user.id,
    category,
    page: parseInt(page),
    limit: parseInt(limit)
  });

  res.json({
    success: true,
    count: result.posts.length,
    total: result.pagination.total,
    pages: result.pagination.pages,
    currentPage: result.pagination.page,
    data: result.posts
  });
});

// GET organization posts
const getOrganizationPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;

  const result = await PostRepository.find({
    organizationId: req.params.orgId,
    category,
    page: parseInt(page),
    limit: parseInt(limit)
  });

  res.json({
    success: true,
    count: result.posts.length,
    total: result.pagination.total,
    pages: result.pagination.pages,
    currentPage: result.pagination.page,
    data: result.posts
  });
});

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  upvotePost,
  getUserPosts,
  getOrganizationPosts
};
