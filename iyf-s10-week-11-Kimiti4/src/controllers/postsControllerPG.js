/**
 * Posts Controller — PostgreSQL
 * CRUD + filtering; Tiannara moderation is fail-closed on create.
 */
const { PostRepository } = require('../database');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const tiannaraService = require('../services/tiannaraService');

const MAX_LIMIT = 50;

function parsePageLimit(page, limit) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || 10));
  return { page: p, limit: l };
}

const getAllPosts = asyncHandler(async (req, res) => {
  const {
    category,
    location,
    county,
    settlement,
    zone,
    search,
    author,
    tag,
    sort = 'newest',
    page = 1,
    limit = 10,
    minPrice,
    maxPrice,
    crop,
    skill,
    organization,
  } = req.query;

  const { page: pageNum, limit: limitNum } = parsePageLimit(page, limit);

  const filters = {
    category,
    organizationId: organization,
    county,
    settlement,
    authorId: author,
    search,
    sort,
    page: pageNum,
    limit: limitNum,
  };

  const result = await PostRepository.find(filters);

  res.json({
    success: true,
    count: result.posts.length,
    total: result.pagination.total,
    pages: result.pagination.pages,
    currentPage: result.pagination.page,
    data: result.posts,
  });
});

const getPostById = asyncHandler(async (req, res) => {
  const post = await PostRepository.findById(req.params.id);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  await PostRepository.incrementViews(req.params.id);

  res.json({
    success: true,
    data: post,
  });
});

const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, location, metadata, tags, organization } =
    req.body;

  // validatePost middleware already enforced title/content/category

  let moderationResult = null;
  try {
    moderationResult = await tiannaraService.moderateContent(content);
  } catch (error) {
    throw new ApiError(
      'Content moderation is unavailable; post not created',
      503,
      { code: 'MODERATION_UNAVAILABLE' }
    );
  }

  if (!tiannaraService.isContentSafe(moderationResult)) {
    throw new ApiError('Content violates community guidelines', 400, {
      code: 'CONTENT_REJECTED',
      errors: [
        tiannaraService.getFlagReason(moderationResult) ||
          'Flagged by moderation',
      ],
    });
  }

  const postData = {
    title,
    content,
    authorId: req.user.id,
    organizationId: organization || null,
    category,
    location: location || {},
    metadata: metadata || {},
    tags: tags || [],
  };

  const post = await PostRepository.create(postData);

  await PostRepository.update(post.id, {
    moderationChecked: true,
    moderationTimestamp: new Date(),
    moderationToxicityScore: moderationResult.toxicity_score,
    moderationSpamScore: moderationResult.spam_probability,
    moderationScamScore: moderationResult.scam_probability,
    moderationFlagged: !moderationResult.safe,
    moderationCategories: moderationResult.categories_flagged,
  });

  res.status(201).json({
    success: true,
    data: post,
    moderation: {
      checked: true,
      safe: moderationResult.safe,
      scores: moderationResult.scores,
    },
  });
});

const updatePost = asyncHandler(async (req, res) => {
  const post = await PostRepository.findById(req.params.id);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  if (post.author.id !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError('Not authorized to update this post', 403);
  }

  const allowedFields = ['title', 'content', 'location', 'metadata', 'tags'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const updatedPost = await PostRepository.update(req.params.id, updates);

  res.json({
    success: true,
    data: updatedPost,
  });
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await PostRepository.findById(req.params.id);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  if (post.author.id !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError('Not authorized to delete this post', 403);
  }

  await PostRepository.delete(req.params.id);

  res.json({
    success: true,
    message: 'Post deleted successfully',
  });
});

const likePost = asyncHandler(async (req, res) => {
  const post = await PostRepository.like(req.params.id);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  const { query } = require('../config/postgres');
  await query(
    `INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [req.user.id, req.params.id]
  ).catch(() => {});

  try {
    const authorId = post.author?.id;
    if (authorId && String(authorId) !== String(req.user.id)) {
      const {
        createNotification,
        emitToUser,
      } = require('./notificationsControllerPG');
      const note = await createNotification({
        userId: authorId,
        actorId: req.user.id,
        type: 'like',
        targetType: 'post',
        referenceId: post.id,
      });
      emitToUser(authorId, 'notification:new', { id: note.id, type: 'like' });
    }
  } catch {
    // best-effort
  }

  res.json({
    success: true,
    data: post,
  });
});

const upvotePost = asyncHandler(async (req, res) => {
  const post = await PostRepository.upvote(req.params.id);

  if (!post) {
    throw new ApiError('Post not found', 404);
  }

  res.json({
    success: true,
    data: post,
  });
});

const engagePost = asyncHandler(async (req, res) => {
  const { type } = req.query;

  if (type === 'like') {
    const post = await PostRepository.like(req.params.id);
    if (!post) {
      throw new ApiError('Post not found', 404);
    }
    return res.json({ success: true, data: post });
  }

  if (type === 'unlike') {
    const post = await PostRepository.unlike(req.params.id);
    if (!post) {
      throw new ApiError('Post not found', 404);
    }
    const { query: q2 } = require('../config/postgres');
    await q2(`DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2`, [
      req.user.id,
      req.params.id,
    ]).catch(() => {});
    return res.json({ success: true, data: post });
  }

  if (type === 'repost' || type === 'unrepost') {
    return res.status(501).json({
      success: false,
      error: {
        message: `Engagement type '${type}' is not available`,
        code: 'ENGAGE_NOT_IMPLEMENTED',
        statusCode: 501,
      },
    });
  }

  throw new ApiError(
    `Unknown engagement type '${type}'. Expected like, unlike, repost, or unrepost.`,
    400,
    { code: 'BAD_REQUEST' }
  );
});

const getUserPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;
  const { page: pageNum, limit: limitNum } = parsePageLimit(page, limit);

  const result = await PostRepository.find({
    authorId: req.user.id,
    category,
    page: pageNum,
    limit: limitNum,
  });

  res.json({
    success: true,
    count: result.posts.length,
    total: result.pagination.total,
    pages: result.pagination.pages,
    currentPage: result.pagination.page,
    data: result.posts,
  });
});

const getOrganizationPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category } = req.query;
  const { page: pageNum, limit: limitNum } = parsePageLimit(page, limit);

  const result = await PostRepository.find({
    organizationId: req.params.orgId,
    category,
    page: pageNum,
    limit: limitNum,
  });

  res.json({
    success: true,
    count: result.posts.length,
    total: result.pagination.total,
    pages: result.pagination.pages,
    currentPage: result.pagination.page,
    data: result.posts,
  });
});

const getTrendingTags = asyncHandler(async (req, res) => {
  const limitNum = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
  const { query } = require('../config/postgres');

  const result = await query(
    `
    SELECT unnest(tags) AS tag, COUNT(*) AS count
    FROM posts
    WHERE tags IS NOT NULL
    GROUP BY tag
    ORDER BY count DESC
    LIMIT $1
  `,
    [limitNum]
  );

  const formattedTags = result.rows.map((row) => ({
    tag: String(row.tag).replace(/^#/, ''),
    count: parseInt(row.count, 10),
  }));

  res.json({
    success: true,
    data: formattedTags,
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
  engagePost,
  getUserPosts,
  getOrganizationPosts,
  getTrendingTags,
};
