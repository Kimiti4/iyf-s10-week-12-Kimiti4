/**
 * 🔹 Posts Controller - Unified for Mtaani/Skills/Farm/Gigs
 * Handles CRUD + filtering + validation + nested comments
 */
const store = require('../data/store');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

// GET all posts with advanced filtering
const getAllPosts = asyncHandler(async (req, res) => {
  const {
    category, location, county, settlement, zone,
    search, author, tag,
    sort = 'newest', page = 1, limit = 10,
    minPrice, maxPrice, crop, skill
  } = req.query;

  let result = [...store.posts];

  // Category filter (core unification)
  if (category) {
    result = result.filter(p => p.category === category);
  }

  // Location filters (geo-unification)
  if (county) {
    result = result.filter(p => p.location?.county?.toLowerCase() === county.toLowerCase());
  }
  if (settlement) {
    result = result.filter(p => p.location?.settlement?.toLowerCase() === settlement.toLowerCase());
  }
  if (zone) {
    result = result.filter(p => p.location?.zone?.toLowerCase() === zone.toLowerCase());
  }

  // Search across title/content/tags
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q)) ||
      p.metadata?.crop?.toLowerCase().includes(q) ||
      p.metadata?.offeredSkill?.toLowerCase().includes(q)
    );
  }

  // Author filter
  if (author) {
    result = result.filter(p => p.author.toLowerCase().includes(author.toLowerCase()));
  }

  // Tag filter
  if (tag) {
    result = result.filter(p => p.tags?.some(t => t.toLowerCase() === tag.toLowerCase()));
  }

  // Domain-specific filters
  if (crop) {
    result = result.filter(p => p.metadata?.crop?.toLowerCase() === crop.toLowerCase());
  }
  if (skill) {
    result = result.filter(p =>
      p.metadata?.offeredSkill?.toLowerCase().includes(skill.toLowerCase()) ||
      p.metadata?.requestedSkill?.toLowerCase().includes(skill.toLowerCase())
    );
  }
  if (minPrice || maxPrice) {
    result = result.filter(p => {
      const price = p.metadata?.pricePerUnit;
      if (!price) return false;
      if (minPrice && price < parseFloat(minPrice)) return false;
      if (maxPrice && price > parseFloat(maxPrice)) return false;
      return true;
    });
  }

  // Sorting
  if (sort === 'newest') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sort === 'oldest') {
    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sort === 'popular') {
    result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (sort === 'urgent') {
    result.sort((a, b) => {
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
    });
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = result.slice(startIndex, startIndex + limitNum);

  res.json({
    success: true,
    data: paginated,
    count: paginated.length,
    total: result.length,
    page: pageNum,
    limit: limitNum,
    filters: { category, location, county, search, sort }
  });
});

// GET single post
const getPostById = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const post = store.posts.find(p => p.id === id);

  if (!post) {
    throw new ApiError('Post not found', 404, { availableIds: store.posts.map(p => p.id) });
  }

  // Include comments if requested
  const includeComments = req.query.comments === 'true';
  const response = { success: true, data: post };

  if (includeComments) {
    response.comments = store.comments?.filter(c => c.postId === id) || [];
  }

  res.json(response);
});

// POST create new post (with validation)
const createPost = asyncHandler(async (req, res) => {
  const { title, content, author, category, location, tags, metadata } = req.body;

  // Validation
  if (!title || title.trim().length < 3) {
    throw new ApiError('Title must be at least 3 characters', 400);
  }
  if (!content || content.trim().length < 10) {
    throw new ApiError('Content must be at least 10 characters', 400);
  }
  if (!author || author.trim().length < 2) {
    throw new ApiError('Author name is required', 400);
  }
  if (!category || !['mtaani', 'skill', 'farm', 'gig', 'alert'].includes(category)) {
    throw new ApiError('Valid category required: mtaani|skill|farm|gig|alert', 400);
  }

  const newPost = {
    id: store.nextPostId(),
    title: title.trim(),
    content: content.trim(),
    author: author.trim(),
    category,
    location: location || { county: 'Unknown' },
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
    metadata: metadata || {},
    createdAt: new Date().toISOString(),
    likes: 0,
    upvotes: 0,
    views: 0
  };

  // Add category-specific defaults
  if (category === 'farm' && !newPost.metadata.pricePerUnit) {
    newPost.metadata.pricePerUnit = 0; // Farmer to fill
  }
  if (category === 'skill' && !newPost.metadata.offeredHours) {
    newPost.metadata.offeredHours = 1; // Default 1 hour
  }

  store.posts.push(newPost);
  res.status(201).json({ success: true, data: newPost });
});

// PUT update post
const updatePost = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const index = store.posts.findIndex(p => p.id === id);

  if (index === -1) {
    throw new ApiError('Post not found', 404);
  }

  const { title, content, metadata } = req.body;

  store.posts[index] = {
    ...store.posts[index],
    title: title !== undefined ? title.trim() : store.posts[index].title,
    content: content !== undefined ? content.trim() : store.posts[index].content,
    metadata: metadata !== undefined ? { ...store.posts[index].metadata, ...metadata } : store.posts[index].metadata,
    updatedAt: new Date().toISOString()
  };

  res.json({ success: true, data: store.posts[index] });
});

// DELETE post
const deletePost = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const index = store.posts.findIndex(p => p.id === id);

  if (index === -1) {
    throw new ApiError('Post not found', 404);
  }

  store.posts.splice(index, 1);
  res.status(204).send();
});

// PATCH like/upvote post
const engagePost = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const { type = 'like' } = req.query; // like or upvote
  const post = store.posts.find(p => p.id === id);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  if (type === 'upvote' && post.urgency) {
    post.upvotes = (post.upvotes || 0) + 1;
  } else {
    post.likes = (post.likes || 0) + 1;
  }

  res.json({ success: true, data: post });
});

// GET comments for a post (Daily Challenge Day 5)
const getComments = asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.id);
  const post = store.posts.find(p => p.id === postId);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  const comments = store.comments?.filter(c => c.postId === postId) || [];

  res.json({
    success: true,
    postId,
    count: comments.length,
    data: comments
  });
});

// POST new comment (Daily Challenge Day 5)
const addComment = asyncHandler(async (req, res) => {
  const postId = parseInt(req.params.id);
  const { content, author } = req.body;

  const post = store.posts.find(p => p.id === postId);
  if (!post) {
    throw new ApiError('Post not found', 404);
  }
  if (!content || content.trim().length < 1) {
    throw new ApiError('Comment content is required', 400);
  }
  if (!author || author.trim().length < 2) {
    throw new ApiError('Author name is required', 400);
  }

  // Initialize comments array if needed
  if (!store.comments) store.comments = [];

  const newComment = {
    id: store.comments.length + 1,
    postId,
    content: content.trim(),
    author: author.trim(),
    createdAt: new Date().toISOString()
  };

  store.comments.push(newComment);
  res.status(201).json({ success: true, data: newComment });
});

// DELETE comment (Daily Challenge Day 5)
const deleteComment = asyncHandler(async (req, res) => {
  const commentId = parseInt(req.params.commentId);
  const index = store.comments?.findIndex(c => c.id === commentId);

  if (index === -1) {
    throw new ApiError('Comment not found', 404);
  }

  store.comments.splice(index, 1);
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
