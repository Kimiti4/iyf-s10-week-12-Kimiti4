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
const { protect } = require('../middleware/requireAuth');

// Public routes
router.get('/', getAlerts);
router.get('/stats', getAlertStats);
router.get('/:id', getAlertById);

// Protected routes (require authentication)
router.post('/', protect, createAlert);
router.put('/:id', protect, updateAlert);
router.delete('/:id', protect, deleteAlert);

// Community confirmation routes
router.post('/:id/confirm', protect, confirmAlert);
router.delete('/:id/confirm', protect, unconfirmAlert);

// Admin/Moderator verification route
router.put('/:id/verify', protect, verifyAlert);

module.exports = router;
