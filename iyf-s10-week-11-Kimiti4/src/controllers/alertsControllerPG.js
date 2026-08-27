const AlertRepository = require('../database/repositories/AlertRepository');
const asyncHandler = require('../utils/asyncHandler');

const getAlerts = asyncHandler(async (req, res) => {
  const result = await AlertRepository.find({
    status: req.query.status || 'active',
    category: req.query.category && req.query.category !== 'all' ? req.query.category : undefined,
    severity: req.query.severity,
    page: req.query.page,
    limit: req.query.limit,
  });
  res.json({ success: true, count: result.alerts.length, total: result.total, page: result.page, pages: Math.ceil(result.total / result.limit), data: result.alerts });
});

const getAlertById = asyncHandler(async (req, res) => {
  const alert = await AlertRepository.findById(req.params.id);
  if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
  await AlertRepository.incrementViews(req.params.id);
  res.json({ success: true, data: alert });
});

const createAlert = asyncHandler(async (req, res) => {
  const { title, description, category, severity } = req.body;
  if (!title || !description || !category || !severity) return res.status(400).json({ success: false, error: 'Please provide title, description, category, and severity' });
  const alert = await AlertRepository.create({ ...req.body, authorId: req.user.id });
  res.status(201).json({ success: true, message: 'Alert created successfully', data: alert });
});

const updateAlert = asyncHandler(async (req, res) => {
  const existing = await AlertRepository.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Alert not found' });
  if (existing.author_id && existing.author_id !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) return res.status(403).json({ success: false, error: 'Not authorized to update this alert' });
  const alert = await AlertRepository.update(req.params.id, req.body);
  res.json({ success: true, message: 'Alert updated successfully', data: alert });
});

const deleteAlert = asyncHandler(async (req, res) => {
  const existing = await AlertRepository.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, error: 'Alert not found' });
  if (existing.author_id && existing.author_id !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) return res.status(403).json({ success: false, error: 'Not authorized to delete this alert' });
  await AlertRepository.remove(req.params.id);
  res.json({ success: true, message: 'Alert removed successfully' });
});

const confirmAlert = asyncHandler(async (req, res) => {
  try {
    const alert = await AlertRepository.confirm(req.params.id, req.user.id);
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
    res.json({ success: true, message: 'Alert confirmed', data: alert });
  } catch (error) {
    if (error.code === '23505') return res.status(400).json({ success: false, error: 'You have already confirmed this alert' });
    throw error;
  }
});

const unconfirmAlert = asyncHandler(async (req, res) => {
  const alert = await AlertRepository.findById(req.params.id);
  if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
  await AlertRepository.unconfirm(req.params.id, req.user.id);
  res.json({ success: true, message: 'Confirmation removed', data: await AlertRepository.findById(req.params.id) });
});

const verifyAlert = asyncHandler(async (req, res) => {
  if (!['admin', 'moderator'].includes(req.user.role)) return res.status(403).json({ success: false, error: 'Not authorized to verify alerts' });
  const { verificationLevel, reviewNotes } = req.body;
  if (!['community_verified', 'mod_verified', 'official'].includes(verificationLevel)) return res.status(400).json({ success: false, error: 'Invalid verification level' });
  const alert = await AlertRepository.verify(req.params.id, req.user.id, verificationLevel, reviewNotes);
  if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
  res.json({ success: true, message: `Alert verified as ${verificationLevel}`, data: alert });
});

const getAlertStats = asyncHandler(async (req, res) => {
  const result = await require('../config/postgres').query(`SELECT category, COUNT(*)::int AS count, AVG(views)::float AS "avgViews" FROM alerts GROUP BY category ORDER BY count DESC`);
  const severity = await require('../config/postgres').query(`SELECT severity AS id, COUNT(*)::int AS count FROM alerts GROUP BY severity`);
  const verification = await require('../config/postgres').query(`SELECT verification_level AS id, COUNT(*)::int AS count FROM alerts GROUP BY verification_level`);
  res.json({ success: true, data: { byCategory: result.rows, bySeverity: severity.rows, byVerification: verification.rows } });
});

module.exports = { getAlerts, getAlertById, createAlert, updateAlert, deleteAlert, confirmAlert, unconfirmAlert, verifyAlert, getAlertStats };
