/**
 * 🔹 Direct Messages Controller - PostgreSQL Version
 * Minimal production-quality DM system: conversations + messages.
 * Every endpoint derives identity from authenticated middleware (req.user.id).
 */
const { query } = require('../config/postgres');
const { UserRepository } = require('../database');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

// Order a pair deterministically to match the CHECK (participant_one < participant_two)
function orderedPair(a, b) {
  return String(a) < String(b) ? [a, b] : [b, a];
}

async function assertParticipant(conversationId, userId) {
  const result = await query(
    `SELECT id FROM conversations
     WHERE id = $1 AND (participant_one = $2 OR participant_two = $3)`,
    [conversationId, userId, userId]
  );
  if (!result.rows[0]) {
    throw new ApiError('Conversation not found', 404);
  }
}

async function participantSummary(userId) {
  const user = await UserRepository.findById(userId);
  if (!user) return { id: userId, username: 'Unknown', avatarIcon: '🦁' };
  return {
    id: user.id,
    username: user.username,
    avatarIcon: user.profile?.avatarIcon || '🦁'
  };
}

// GET /api/messages/conversations - list current user's conversations
const listConversations = asyncHandler(async (req, res) => {
  const result = await query(
    `SELECT c.*,
       (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
       (SELECT created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message_at,
       (SELECT COUNT(*)::int FROM messages m WHERE m.conversation_id = c.id AND m.sender_id <> $1 AND m.read_at IS NULL) AS unread_count
     FROM conversations c
     WHERE c.participant_one = $1 OR c.participant_two = $1
     ORDER BY c.updated_at DESC`,
    [req.user.id]
  );

  const data = await Promise.all(result.rows.map(async (row) => {
    const otherId = String(row.participant_one) === String(req.user.id)
      ? row.participant_two
      : row.participant_one;
    return {
      id: row.id,
      participant: await participantSummary(otherId),
      lastMessage: row.last_message,
      lastMessageAt: row.last_message_at,
      unreadCount: row.unread_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }));

  res.json({ success: true, count: data.length, data });
});

// POST /api/messages/conversations - get-or-create DM with another user
const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { userId } = req.body || {};
  if (!userId) {
    throw new ApiError('userId is required', 400);
  }
  if (String(userId) === String(req.user.id)) {
    throw new ApiError('Cannot start a conversation with yourself', 400);
  }
  const other = await UserRepository.findById(userId);
  if (!other) {
    throw new ApiError('User not found', 404);
  }
  const [one, two] = orderedPair(req.user.id, userId);
  const result = await query(
    `INSERT INTO conversations (participant_one, participant_two)
     VALUES ($1, $2)
     ON CONFLICT (participant_one, participant_two)
     DO UPDATE SET updated_at = NOW()
     RETURNING *`,
    [one, two]
  );
  const row = result.rows[0];
  res.status(201).json({
    success: true,
    data: {
      id: row.id,
      participant: await participantSummary(userId),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  });
});

// GET /api/messages/conversations/:id - fetch messages
const getMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
  await assertParticipant(id, req.user.id);
  const result = await query(
    `SELECT m.*, u.username AS sender_username
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id = $1
     ORDER BY m.created_at ASC
     LIMIT $2`,
    [id, limit]
  );
  res.json({
    success: true,
    count: result.rows.length,
    data: result.rows.map((m) => ({
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      senderUsername: m.sender_username,
      content: m.content,
      createdAt: m.created_at,
      readAt: m.read_at
    }))
  });
});

// POST /api/messages/conversations/:id/messages - send a message
const sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body || {};
  if (!content || !String(content).trim()) {
    throw new ApiError('Message content is required', 400);
  }
  if (String(content).length > 2000) {
    throw new ApiError('Message is too long (max 2000 characters)', 400);
  }
  await assertParticipant(id, req.user.id);
  const result = await query(
    `INSERT INTO messages (conversation_id, sender_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [id, req.user.id, String(content).trim()]
  );
  await query(`UPDATE conversations SET updated_at = NOW() WHERE id = $1`, [id]);
  const m = result.rows[0];

  // Realtime delivery on the existing Socket.IO infrastructure,
  // targeted at participant sockets only (never broadcast).
  try {
    const { getIO } = require('../services/socketService');
    const io = getIO();
    const convo = await query(
      `SELECT participant_one, participant_two FROM conversations WHERE id = $1`,
      [id]
    );
    const targets = new Set(
      [convo.rows[0]?.participant_one, convo.rows[0]?.participant_two].map(String)
    );
    const payload = {
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      content: m.content,
      createdAt: m.created_at
    };
    for (const [, sock] of io.sockets.sockets) {
      if (sock.data?.user && targets.has(String(sock.data.user.id))) {
        sock.emit('message:new', payload);
      }
    }
  } catch {
    // Socket not initialized (e.g. tests) — REST response is authoritative
  }

  res.status(201).json({
    success: true,
    data: {
      id: m.id,
      conversationId: m.conversation_id,
      senderId: m.sender_id,
      content: m.content,
      createdAt: m.created_at,
      readAt: m.read_at
    }
  });
});

// PATCH /api/messages/conversations/:id/read - mark peer messages read
const markRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await assertParticipant(id, req.user.id);
  const result = await query(
    `UPDATE messages SET read_at = NOW()
     WHERE conversation_id = $1 AND sender_id <> $2 AND read_at IS NULL
     RETURNING id`,
    [id, req.user.id]
  );
  res.json({ success: true, markedRead: result.rows.length });
});

module.exports = {
  listConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markRead
};
