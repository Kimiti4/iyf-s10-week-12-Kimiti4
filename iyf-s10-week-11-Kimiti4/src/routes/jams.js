/**
 * 🔹 Jam Routes - flagship creator-led content primitive
 * Only endpoints with actual UI callers are implemented (see jamApi.js usage).
 * No update/delete/transition/search/trending/reactions endpoints: no callers.
 */
const express = require('express');
const router = express.Router();
const jamsController = require('../controllers/jamsControllerPG');
const { protect } = require('../middleware/authPG');

// Public discovery/detail
router.get('/', jamsController.getAllJams);
router.get('/:id', jamsController.getJamById);

// Creation (protected; creator auto-joins)
router.post('/', protect, jamsController.createJam);

// Participation (protected mutations, public reads)
router.post('/:id/participants', protect, jamsController.joinJam);
router.delete('/:id/participants', protect, jamsController.leaveJam);
router.get('/:id/participants', jamsController.getParticipants);
router.get('/:id/participants/me', protect, jamsController.checkMembership);

// Contributions
router.get('/:id/contributions', jamsController.getContributions);
router.post('/:id/contributions', protect, jamsController.createContribution);

// Leaderboard (public aggregate)
router.get('/:id/leaderboard', jamsController.getLeaderboard);

module.exports = router;
