const { query } = require('../config/postgres');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const VALID_TYPES = new Set(['post', 'comment', 'user']);
const VALID_REASONS = new Set(['spam', 'harassment', 'hate', 'scam', 'sexual', 'violence', 'misinformation', 'other']);
const VALID_STATUSES = new Set(['open', 'reviewing', 'resolved', 'dismissed']);

const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason, details } = req.body || {};
  if (!VALID_TYPES.has(targetType) || !/^[0-9a-f-]{36}$/i.test(String(targetId || ''))) {
    throw new ApiError('A valid report target is required', 400);
  }
  if (!VALID_REASONS.has(reason)) throw new ApiError('Invalid report reason', 400);
  if (details !== undefined && (typeof details !== 'string' || details.length > 2000)) {
    throw new ApiError('Report details must be 2000 characters or fewer', 400);
  }
  if (targetType === 'user' && String(targetId) === String(req.user.id)) {
    throw new ApiError('You cannot report yourself', 400);
  }

  const recent = await query(
    `SELECT id FROM content_reports
     WHERE reporter_id = $1 AND target_type = $2 AND target_id = $3
       AND status IN ('open', 'reviewing')
       AND created_at > NOW() - INTERVAL '24 hours'
     LIMIT 1`,
    [req.user.id, targetType, targetId]
  );
  if (recent.rows.length) throw new ApiError('You already have an open report for this content', 409);

  const result = await query(
    `INSERT INTO content_reports
      (reporter_id, target_type, target_id, reason, details)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, target_type, target_id, reason, status, created_at`,
    [req.user.id, targetType, targetId, reason, details || null]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

const listReports = asyncHandler(async (req, res) => {
  const status = req.query.status || 'open';
  if (!VALID_STATUSES.has(status)) throw new ApiError('Invalid report status', 400);
  const result = await query(
    `SELECT r.id, r.target_type, r.target_id, r.reason, r.details, r.status,
            r.review_note, r.created_at, r.updated_at,
            r.reporter_id, u.username AS reporter_username
     FROM content_reports r
     LEFT JOIN users u ON u.id = r.reporter_id
     WHERE r.status = $1
     ORDER BY r.created_at ASC
     LIMIT 100`,
    [status]
  );
  res.json({ success: true, count: result.rows.length, data: result.rows });
});

const reviewReport = asyncHandler(async (req, res) => {
  const { status, reviewNote } = req.body || {};
  if (!VALID_STATUSES.has(status) || status === 'open') {
    throw new ApiError('Review status must be reviewing, resolved, or dismissed', 400);
  }
  if (reviewNote !== undefined && (typeof reviewNote !== 'string' || reviewNote.length > 2000)) {
    throw new ApiError('Review note must be 2000 characters or fewer', 400);
  }
  const result = await query(
    `UPDATE content_reports
     SET status = $1, reviewed_by = $2, review_note = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING id, target_type, target_id, status, review_note, reviewed_by, updated_at`,
    [status, req.user.id, reviewNote || null, req.params.id]
  );
  if (!result.rows[0]) throw new ApiError('Report not found', 404);
  res.json({ success: true, data: result.rows[0] });
});

module.exports = { createReport, listReports, reviewReport };
