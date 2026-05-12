/**
 * 🔹 Organization Routes
 * API endpoints for organization management
 */
const express = require('express');
const router = express.Router();
const {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  getMyOrganizations,
  joinOrganization,
  leaveOrganization,
  getMembers,
  updateMemberRole,
  approveMember,
  removeMember,
  transferOwnership,
  getAnalytics
} = require('../controllers/organizationsController');
const { protect } = require('../middleware/requireAuth');

// Public routes
router.get('/', getOrganizations);
router.get('/:slug', getOrganization);

// Protected routes (require authentication)
router.use(protect);

// My organizations
router.get('/my', getMyOrganizations);

// Create organization
router.post('/', createOrganization);

// Organization-specific routes
router.put('/:id', updateOrganization);
router.delete('/:id', deleteOrganization);

// Membership management
router.post('/:id/join', joinOrganization);
router.post('/:id/leave', leaveOrganization);
router.get('/:id/members', getMembers);
router.put('/:id/members/:userId', updateMemberRole);
router.post('/:id/members/:userId/approve', approveMember);
router.delete('/:id/members/:userId', removeMember);

// Ownership & Analytics
router.post('/:id/transfer', transferOwnership);
router.get('/:id/analytics', getAnalytics);

module.exports = router;
