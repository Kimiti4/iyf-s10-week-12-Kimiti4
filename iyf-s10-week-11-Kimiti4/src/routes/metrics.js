/**
 * 🔹 Metrics Routes
 * API endpoints for platform statistics and analytics
 *
 * R1 authorization policy:
 *   GET /api/metrics/platform                   -> public (aggregate only)
 *   GET /api/metrics/trending                   -> public
 *   GET /api/metrics/users/:userId/activity     -> protect; self/admin/founder/moderator  [P0-3]
 *   GET /api/metrics/users/:userId/avatar-icon  -> protect  (PII: username leak)
 *   GET /api/metrics/organizations/:orgId/health -> public
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
const { protect } = require('../middleware/authPG'); // PostgreSQL version

// Public routes - Platform stats
router.get('/platform', getPlatformMetrics);
router.get('/trending', getTrendingContent);

// Organization routes
router.get('/organizations/:orgId/health', getOrgMetrics);

// User-specific routes (R1: protected)
router.get('/users/:userId/activity', protect, getUserMetrics);
router.get('/users/:userId/avatar-icon', protect, getUserAvatarIcon);

module.exports = router;
