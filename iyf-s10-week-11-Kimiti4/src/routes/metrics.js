/**
 * 🔹 Metrics Routes
 * API endpoints for platform statistics and analytics
 */
const express = require('express');
const router = express.Router();
const {
  getPlatformMetrics,
  getTrendingContent,
  getUserMetrics,
  getOrgMetrics,
  getUserAvatarIcon
} = require('../controllers/metricsControllerPG'); // PostgreSQL version

// Public routes - Platform stats
router.get('/platform', getPlatformMetrics);
router.get('/trending', getTrendingContent);

// User-specific routes
router.get('/users/:userId/activity', getUserMetrics);
router.get('/users/:userId/avatar-icon', getUserAvatarIcon);

// Organization routes
router.get('/organizations/:orgId/health', getOrgMetrics);

module.exports = router;
