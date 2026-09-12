const express = require('express');
const router = express.Router();
const impactController = require('../controllers/impactController');
const { protect } = require('../middleware/authPG');

// POST /api/impact/track
router.post('/track', protect, impactController.trackImpact);

// GET /api/impact/:id/dashboard (R3 [P1-8]: per-user data requires protect)
router.get('/:id/dashboard', protect, impactController.getImpactDashboard);

module.exports = router;
