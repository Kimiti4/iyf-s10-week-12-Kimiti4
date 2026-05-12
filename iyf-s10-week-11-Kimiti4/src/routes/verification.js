/**
 * 🔹 Verification Routes
 * API endpoints for user and organization verification with unique badges
 */
const express = require('express');
const router = express.Router();
const {
  verifyUser,
  unverifyUser,
  getUserBadge,
  verifyOrganization,
  unverifyOrganization,
  getOrganizationBadge,
  getBadgeConfigs
} = require('../controllers/verificationController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes - Get badge information
router.get('/badges/config', getBadgeConfigs);
router.get('/users/:userId/badge', getUserBadge);
router.get('/organizations/:orgId/badge', getOrganizationBadge);

// Protected routes - Admin only
router.use(protect);
router.use(restrictTo('admin'));

// User verification
router.post('/users/:userId/verify', verifyUser);
router.delete('/users/:userId/verify', unverifyUser);

// Organization verification
router.post('/organizations/:orgId/verify', verifyOrganization);
router.delete('/organizations/:orgId/verify', unverifyOrganization);

module.exports = router;
