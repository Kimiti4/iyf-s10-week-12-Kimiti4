const { query } = require('../config/postgres');
const asyncHandler = require('../utils/asyncHandler');

const ALLOWED_TYPES = new Set(['bug', 'feature', 'general']);
const ALLOWED_PRIORITIES = new Set(['low', 'medium', 'high']);

const submitFeedback = asyncHandler(async (req, res) => {
  const { name, email, type, priority = 'medium', message } = req.body || {};
  const cleanName = typeof name === 'string' ? name.trim().slice(0, 120) : null;
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase().slice(0, 255) : null;
  const cleanMessage = typeof message === 'string' ? message.trim() : '';

  if (!ALLOWED_TYPES.has(type)) return res.status(400).json({ success: false, error: 'Invalid feedback type' });
  if (!ALLOWED_PRIORITIES.has(priority)) return res.status(400).json({ success: false, error: 'Invalid feedback priority' });
  if (!cleanMessage || cleanMessage.length > 5000) return res.status(400).json({ success: false, error: 'Feedback message must be between 1 and 5000 characters' });
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return res.status(400).json({ success: false, error: 'Please provide a valid email address' });

  const result = await query(
    `INSERT INTO feedback (user_id, name, email, type, priority, message)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, type, priority, status, created_at`,
    [req.user?.id || null, cleanName, cleanEmail, type, priority, cleanMessage]
  );
  res.status(201).json({ success: true, data: result.rows[0] });
});

module.exports = { submitFeedback };
