const express = require('express');
const router = express.Router();
const impactController = require('../controllers/impactController');
const { protect } = require('../middleware/authPG');

// POST /api/impact/track
router.post('/track', protect, impactController.trackImpact);

// GET /api/impact/:id/dashboard
router.get('/:id/dashboard', impactController.getImpactDashboard);

module.exports = router;
