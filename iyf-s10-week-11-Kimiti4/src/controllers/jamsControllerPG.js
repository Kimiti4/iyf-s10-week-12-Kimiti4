/**
 * 🔹 Jams Controller - PostgreSQL Version
 * Flagship creator-led content primitive: CRUD + participants + contributions.
 * Identity is always server-derived (req.user.id); the client never supplies
 * the acting user. No transition/update/delete endpoints: the current UI has
 * no callers for them, so they are deliberately not implemented.
 */
const { query } = require('../config/postgres');
const { UserRepository } = require('../database');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const VALID_CATEGORIES = new Set([
  'creator', 'mtaani', 'skills', 'gigs', 'farm',
  'gaming', 'music', 'challenge', 'community', 'other'
]);
const VALID_TYPES = new Set(['video', 'image', 'post', 'poll', 'location', 'skill', 'gig']);
const VALID_SORTS = new Set(['newest', 'popular', 'ending']);

function formatJam(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    prompt: row.prompt,
    category: row.category,
    status: row.status,
    participationTypes: row.participation_types || [],
    deadline: row.deadline,
    coverMediaUrl: row.cover_media_url,
    creator: row.creator_id ? {
      _id: row.creator_id,
      id: row.creator_id,
      username: row.creator_username || 'Anonymous',
      profile: { avatar: row.creator_avatar_url || null }
    } : { _id: 'unknown', username: 'Anonymous', profile: {} },
    participantCount: parseInt(row.participant_count ?? 0, 10),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function validateJamInput({ title, description, prompt, category, participationTypes, deadline }) {
  const errors = [];
  if (!title || !String(title).trim()) errors.push('Title is required');
  else if (String(title).trim().length > 120) errors.push('Title must be 120 characters or less');
  if (prompt !== undefined && prompt !== null && String(prompt).length > 500) {
    errors.push('Prompt must be 500 characters or less');
  }
  if (description !== undefined && description !== null && String(description).length > 2000) {
    errors.push('Description must be 2000 characters or less');
  }
  if (category !== undefined && category !== null && category !== '' && !VALID_CATEGORIES.has(String(category))) {
    errors.push(`Category must be one of: ${[...VALID_CATEGORIES].join(', ')}`);
  }
  if (participationTypes !== undefined && participationTypes !== null) {
    if (!Array.isArray(participationTypes) || participationTypes.length === 0) {
      errors.push('At least one participation type is required');
    } else if (participationTypes.length > 3) {
      errors.push('At most 3 participation types are allowed');
    } else if (!participationTypes.every((t) => VALID_TYPES.has(String(t)))) {
      errors.push('Invalid participation type');
    }
  }
  if (deadline !== undefined && deadline !== null && deadline !== '') {
    const d = new Date(deadline);
    if (Number.isNaN(d.getTime())) errors.push('Deadline must be a valid date');
  }
  return errors;
}

// A jam accepts joins/contributions while ACTIVE, or while DRAFT/SCHEDULED
// without a passed deadline (matches frontend isJamOpen for ACTIVE; the
// detail page only renders Join when open).
function isOpenForParticipation(jam) {
  if (!jam) return false;
  if (jam.status === 'ended' || jam.status === 'archived') return false;
  if (jam.deadline && new Date(jam.deadline) < new Date()) return false;
  return true;
}

// GET /api/jams — discover/list (public)
const getAllJams = asyncHandler(async (req, res) => {
  const { category, sort = 'newest', page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const values = [];
  if (category) {
    conditions.push(`j.category = $${values.length + 1}`);
    values.push(String(category));
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy = 'j.created_at DESC';
  if (sort === 'popular') orderBy = 'participant_count DESC, j.created_at DESC';
  else if (sort === 'ending') orderBy = 'j.deadline ASC NULLS LAST, j.created_at DESC';

  const result = await query(
    `SELECT j.*,
       u.username AS creator_username, u.avatar_url AS creator_avatar_url,
       (SELECT COUNT(*) FROM jam_participants p WHERE p.jam_id = j.id) AS participant_count
     FROM jams j
     LEFT JOIN users u ON u.id = j.creator_id
     ${where}
     ORDER BY ${orderBy}
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limitNum, offset]
  );
  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM jams j ${where}`,
    values
  );
  const total = countResult.rows[0].total;

  res.json({
    success: true,
    count: result.rows.length,
    total,
    pages: Math.ceil(total / limitNum),
    currentPage: pageNum,
    jams: result.rows.map(formatJam)
  });
});

// GET /api/jams/:id — retrieve (public)
const getJamById = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT j.*,
       u.username AS creator_username, u.avatar_url AS creator_avatar_url,
       (SELECT COUNT(*) FROM jam_participants p WHERE p.jam_id = j.id) AS participant_count
     FROM jams j
     LEFT JOIN users u ON u.id = j.creator_id
     WHERE j.id = $1`,
    [req.params.id]
  );
  const jam = formatJam(result.rows[0]);
  if (!jam) {
    throw new ApiError('Jam not found', 404);
  }
  res.json({ success: true, jam });
});

// POST /api/jams — create (protected; creator auto-joins as member)
const createJam = asyncHandler(async (req, res) => {
  const { title, description, prompt, category, participationTypes, deadline, coverMediaUrl } = req.body || {};
  const errors = validateJamInput({ title, description, prompt, category, participationTypes, deadline });
  if (errors.length > 0) {
    throw new ApiError(errors.join('; '), 400);
  }
  const result = await query(
    `INSERT INTO jams
       (creator_id, title, description, prompt, category, status, participation_types, deadline, cover_media_url)
     VALUES ($1, $2, $3, $4, $5, 'draft', $6, $7, $8)
     RETURNING *`,
    [
      req.user.id,
      String(title).trim(),
      description ? String(description) : null,
      prompt ? String(prompt) : null,
      category ? String(category) : 'creator',
      (participationTypes && participationTypes.length ? participationTypes : ['post']).map(String),
      deadline ? new Date(deadline) : null,
      coverMediaUrl ? String(coverMediaUrl) : null
    ]
  );
  const jamId = result.rows[0].id;
  await query(
    `INSERT INTO jam_participants (jam_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [jamId, req.user.id]
  );
  const full = await query(
    `SELECT j.*,
       u.username AS creator_username, u.avatar_url AS creator_avatar_url,
       1 AS participant_count
     FROM jams j
     LEFT JOIN users u ON u.id = j.creator_id
     WHERE j.id = $1`,
    [jamId]
  );
  res.status(201).json({ success: true, jam: formatJam(full.rows[0]) });
});

// POST /api/jams/:id/participants — join (protected)
const joinJam = asyncHandler(async (req, res) => {
  const jamResult = await query(`SELECT * FROM jams WHERE id = $1`, [req.params.id]);
  const jam = jamResult.rows[0];
  if (!jam) {
    throw new ApiError('Jam not found', 404);
  }
  if (!isOpenForParticipation(jam)) {
    throw new ApiError('This Jam is not open for participation', 403);
  }
  try {
    await query(
      `INSERT INTO jam_participants (jam_id, user_id) VALUES ($1, $2)`,
      [req.params.id, req.user.id]
    );
  } catch (err) {
    if (err.code === '23505') {
      return res.json({ success: true, message: 'Already a participant', alreadyMember: true });
    }
    throw err;
  }
  res.status(201).json({ success: true, message: 'Joined jam', jamId: req.params.id });
});

// DELETE /api/jams/:id/participants — leave (protected)
const leaveJam = asyncHandler(async (req, res) => {
  const jamResult = await query(`SELECT * FROM jams WHERE id = $1`, [req.params.id]);
  if (!jamResult.rows[0]) {
    throw new ApiError('Jam not found', 404);
  }
  // Least destructive: membership only. Ownership stays with the creator;
  // there is no ownership-transfer concept in the current product.
  const result = await query(
    `DELETE FROM jam_participants WHERE jam_id = $1 AND user_id = $2 RETURNING *`,
    [req.params.id, req.user.id]
  );
  if (!result.rows[0]) {
    throw new ApiError('You are not a participant of this Jam', 404);
  }
  res.json({ success: true, message: 'Left jam', jamId: req.params.id });
});

// GET /api/jams/:id/participants — list (public)
const getParticipants = asyncHandler(async (req, res) => {
  const jamResult = await query(`SELECT id FROM jams WHERE id = $1`, [req.params.id]);
  if (!jamResult.rows[0]) {
    throw new ApiError('Jam not found', 404);
  }
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
  const result = await query(
    `SELECT u.id AS user_id, u.username, u.avatar_url AS "avatarUrl", p.joined_at
     FROM jam_participants p
     JOIN users u ON u.id = p.user_id
     WHERE p.jam_id = $1
     ORDER BY p.joined_at ASC
     LIMIT $2`,
    [req.params.id, limit]
  );
  res.json({
    success: true,
    count: result.rows.length,
    participants: result.rows.map((r) => ({
      id: r.user_id,
      userId: r.user_id,
      username: r.username,
      avatarUrl: r.avatarUrl,
      user: { _id: r.user_id, username: r.username, profile: { avatar: r.avatarUrl } },
      joinedAt: r.joined_at
    }))
  });
});

// GET /api/jams/:id/participants/me — membership check (protected)
const checkMembership = asyncHandler(async (req, res) => {
  const jamResult = await query(`SELECT id FROM jams WHERE id = $1`, [req.params.id]);
  if (!jamResult.rows[0]) {
    throw new ApiError('Jam not found', 404);
  }
  const result = await query(
    `SELECT 1 FROM jam_participants WHERE jam_id = $1 AND user_id = $2`,
    [req.params.id, req.user.id]
  );
  const isMember = result.rows.length > 0;
  res.json({ success: true, isMember, joined: isMember });
});

// POST /api/jams/:id/contributions — contribute (protected, members, open jams)
const createContribution = asyncHandler(async (req, res) => {
  const { type, textContent, contentUrl } = req.body || {};
  const jamResult = await query(`SELECT * FROM jams WHERE id = $1`, [req.params.id]);
  const jam = jamResult.rows[0];
  if (!jam) {
    throw new ApiError('Jam not found', 404);
  }
  const member = await query(
    `SELECT 1 FROM jam_participants WHERE jam_id = $1 AND user_id = $2`,
    [req.params.id, req.user.id]
  );
  if (!member.rows[0]) {
    throw new ApiError('Join this Jam before contributing', 403);
  }
  if (!isOpenForParticipation(jam)) {
    throw new ApiError('This Jam is not accepting contributions', 403);
  }
  const cleanType = type ? String(type) : 'post';
  const validTypes = new Set(['video', 'image', 'post', 'poll', 'location', 'skill', 'gig']);
  if (!validTypes.has(cleanType)) {
    throw new ApiError('Invalid contribution type', 400);
  }
  const text = textContent ? String(textContent).trim() : null;
  const url = contentUrl ? String(contentUrl).trim() : null;
  if ((!text || text.length === 0) && (!url || url.length === 0)) {
    throw new ApiError('Contribution requires text content or a content URL', 400);
  }
  if (text && text.length > 2000) {
    throw new ApiError('Contribution text is too long (max 2000 characters)', 400);
  }
  // Optional: only allow types the jam accepts (when the jam restricts them)
  if (Array.isArray(jam.participation_types) && jam.participation_types.length > 0 &&
      !jam.participation_types.includes(cleanType)) {
    throw new ApiError(`This Jam does not accept '${cleanType}' contributions`, 400);
  }
  const result = await query(
    `INSERT INTO jam_contributions (jam_id, user_id, type, text_content, content_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [req.params.id, req.user.id, cleanType, text, url]
  );
  const c = result.rows[0];
  res.status(201).json({
    success: true,
    contribution: {
      id: c.id,
      jamId: c.jam_id,
      userId: c.user_id,
      type: c.type,
      textContent: c.text_content,
      contentUrl: c.content_url,
      status: c.status,
      voteCount: 0,
      createdAt: c.created_at
    }
  });
});

// GET /api/jams/:id/contributions — list (public)
const getContributions = asyncHandler(async (req, res) => {
  const jamResult = await query(`SELECT id FROM jams WHERE id = $1`, [req.params.id]);
  if (!jamResult.rows[0]) {
    throw new ApiError('Jam not found', 404);
  }
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
  const result = await query(
    `SELECT c.*, u.username AS author_username
     FROM jam_contributions c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.jam_id = $1
     ORDER BY c.created_at ASC
     LIMIT $2`,
    [req.params.id, limit]
  );
  res.json({
    success: true,
    count: result.rows.length,
    contributions: result.rows.map((c) => ({
      id: c.id,
      jamId: c.jam_id,
      userId: c.user_id,
      user: { _id: c.user_id, username: c.author_username || 'Anonymous', profile: {} },
      type: c.type,
      textContent: c.text_content,
      contentUrl: c.content_url,
      status: c.status,
      voteCount: 0,
      createdAt: c.created_at
    }))
  });
});

// GET /api/jams/:id/leaderboard — rank participants by contribution count (public)
const getLeaderboard = asyncHandler(async (req, res) => {
  const jamResult = await query(`SELECT id FROM jams WHERE id = $1`, [req.params.id]);
  if (!jamResult.rows[0]) {
    throw new ApiError('Jam not found', 404);
  }
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const result = await query(
    `SELECT u.id AS user_id, u.username, u.avatar_url AS "avatarUrl",
       COUNT(c.id)::int AS "contributionCount",
       ROW_NUMBER() OVER (ORDER BY COUNT(c.id) DESC, MIN(c.created_at) ASC NULLS LAST) AS rank
     FROM jam_participants p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN jam_contributions c ON c.jam_id = p.jam_id AND c.user_id = p.user_id
     WHERE p.jam_id = $1
     GROUP BY u.id, u.username, u.avatar_url
     ORDER BY "contributionCount" DESC
     LIMIT $2`,
    [req.params.id, limit]
  );
  res.json({
    success: true,
    count: result.rows.length,
    // NOTE: voteCount is 0 — no voting mechanism exists in the product, so
    // there are genuinely zero votes. Field kept for UI shape compatibility.
    leaderboard: result.rows.map((r) => ({
      userId: r.user_id,
      username: r.username,
      avatarUrl: r.avatarUrl,
      rank: parseInt(r.rank, 10),
      contributionCount: r.contributionCount,
      voteCount: 0
    }))
  });
});

module.exports = {
  getAllJams,
  getJamById,
  createJam,
  joinJam,
  leaveJam,
  getParticipants,
  checkMembership,
  createContribution,
  getContributions,
  getLeaderboard
};
