/**
 * 🔹 Alert Routes
 * API endpoints for community alerts system
 */

const express = require('express');
const router = express.Router();
const {
  getAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
  confirmAlert,
  unconfirmAlert,
  verifyAlert,
  getAlertStats
} = require('../controllers/alertsController');
const requireAuth = require('../middleware/requireAuth');

// Public routes
router.get('/', getAlerts);
router.get('/stats', getAlertStats);
router.get('/:id', getAlertById);

// Protected routes (require authentication)
router.post('/', requireAuth, createAlert);
router.put('/:id', requireAuth, updateAlert);
router.delete('/:id', requireAuth, deleteAlert);

// Community confirmation routes
router.post('/:id/confirm', requireAuth, confirmAlert);
router.delete('/:id/confirm', requireAuth, unconfirmAlert);

// Admin/Moderator verification route
router.put('/:id/verify', requireAuth, verifyAlert);

module.exports = router;
