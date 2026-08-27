const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skillsController');
const { protect } = require('../middleware/authPG');

// GET /api/skills/profile
router.get('/profile', protect, skillsController.getProfile);

// POST /api/skills/profile
router.post('/profile', protect, skillsController.saveProfile);

// GET /api/skills/matches
router.get('/matches', protect, skillsController.getMatches);

// POST /api/skills/complete/:match_id
router.post('/complete/:match_id', protect, skillsController.completeExchange);

module.exports = router;
