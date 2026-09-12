/**
 * 🔹 Notifications Controller - PostgreSQL Version
 * Persisted per-user notifications. All endpoints derive identity from
 * authenticated middleware (req.user.id).
 */
const { query } = require('../config/postgres');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

function formatNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type,
    read: !!row.is_read,
    actor: row.actor_id ? {
      id: row.actor_id,
      username: row.actor_username || 'Someone',
      avatar: row.actor_avatar_icon || null
    } : null,
    targetType: row.target_type || 'post',
    targetId: row.reference_id,
    message: row.message,
    createdAt: row.created_at
  };
}

// GET /api/notifications - list own notifications (paginated)
const listNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
  const offset = (page - 1) * limit;
  const result = await query(
    `SELECT n.*, u.username AS actor_username, u.avatar_icon AS actor_avatar_icon
     FROM notifications n
     LEFT JOIN users u ON u.id = n.actor_id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC
     LIMIT $2 OFFSET $3`,
    [req.user.id, limit, offset]
  );
  const countResult = await query(
    `SELECT COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE is_read = FALSE)::int AS unread
     FROM notifications WHERE user_id = $1`,
    [req.user.id]
  );
  const total = countResult.rows[0].total;
  res.json({
    success: true,
    notifications: result.rows.map(formatNotification),
    unreadCount: countResult.rows[0].unread,
    hasMore: page * limit < total
  });
});

// GET /api/notifications/unread-count
const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
    [req.user.id]
  );
  res.json({ success: true, count: result.rows[0].count });
});

// PATCH /api/notifications/:id/read - owner only
const markRead = asyncHandler(async (req, res) => {
  const result = await query(
    `UPDATE notifications SET is_read = TRUE
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [req.params.id, req.user.id]
  );
  if (!result.rows[0]) {
    throw new ApiError('Notification not found', 404);
  }
  res.json({ success: true, data: formatNotification(result.rows[0]) });
});

// PATCH /api/notifications/read-all
const markAllRead = asyncHandler(async (req, res) => {
  const result = await query(
    `UPDATE notifications SET is_read = TRUE
     WHERE user_id = $1 AND is_read = FALSE
     RETURNING id`,
    [req.user.id]
  );
  res.json({ success: true, markedRead: result.rows.length });
});

// Internal helper: create a notification (used by follow/like/comment flows)
async function createNotification({ userId, actorId = null, type, referenceId = null, message = null, targetType = 'post' }) {
  const result = await query(
    `INSERT INTO notifications (user_id, actor_id, type, reference_id, message, target_type)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [userId, actorId, type, referenceId, message, targetType]
  );
  return result.rows[0];
}

// Internal helper: emit to a single user's connected sockets
function emitToUser(userId, event, payload) {
  try {
    const { getIO } = require('../services/socketService');
    const io = getIO();
    for (const [, sock] of io.sockets.sockets) {
      if (sock.data?.user && String(sock.data.user.id) === String(userId)) {
        sock.emit(event, payload);
      }
    }
  } catch {
    // Socket not initialized — REST polling remains functional
  }
}

module.exports = {
  listNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  createNotification,
  emitToUser
};
