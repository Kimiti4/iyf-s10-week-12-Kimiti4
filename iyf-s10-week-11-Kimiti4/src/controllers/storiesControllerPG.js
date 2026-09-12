/**
 * 🔹 Stories Controller - PostgreSQL Version
 * 24h ephemeral stories. image_url is client-provided (URL-only pattern,
 * same as jam cover_media_url) — no upload backend exists.
 */
const { query } = require('../config/postgres');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

// GET /api/stories/me - own active stories (protected)
const getMyStories = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT * FROM stories
     WHERE user_id = $1 AND expires_at > NOW()
     ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, count: result.rows.length, data: result.rows });
});

// GET /api/stories/user/:userId - active stories of a user (protected)
const getUserStories = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT id, user_id, text_content, image_url, created_at, expires_at
     FROM stories
     WHERE user_id = $1 AND expires_at > NOW()
     ORDER BY created_at DESC`,
    [req.params.userId]
  );
  res.json({ success: true, count: result.rows.length, data: result.rows });
});

// POST /api/stories - create (protected; text and/or image URL required)
const createStory = asyncHandler(async (req, res) => {
  const { textContent, imageUrl } = req.body || {};
  const text = textContent ? String(textContent).trim() : null;
  const image = imageUrl ? String(imageUrl).trim() : null;
  if ((!text || text.length === 0) && (!image || image.length === 0)) {
    throw new ApiError('Story requires text content or an image URL', 400);
  }
  if (text && text.length > 500) {
    throw new ApiError('Story text is too long (max 500 characters)', 400);
  }
  const result = await query(
    `INSERT INTO stories (user_id, text_content, image_url)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [req.user.id, text, image]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

// DELETE /api/stories/:id - owner only
const deleteStory = asyncHandler(async (req, res) => {
  const result = await query(
    `DELETE FROM stories WHERE id = $1 AND user_id = $2 RETURNING id`,
    [req.params.id, req.user.id]
  );
  if (!result.rows[0]) {
    throw new ApiError('Story not found', 404);
  }
  res.json({ success: true, message: 'Story deleted' });
});

module.exports = {
  getMyStories,
  getUserStories,
  createStory,
  deleteStory
};
