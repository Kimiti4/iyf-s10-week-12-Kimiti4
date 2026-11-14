/**
 * Jam routes — flagship creator-led content primitive
 * Only endpoints with actual UI callers are implemented.
 */
const express = require('express');
const router = express.Router();
const jamsController = require('../controllers/jamsControllerPG');
const { protect } = require('../middleware/authPG');
const { validateJam } = require('../middleware/validate');

// Public discovery/detail
router.get('/', jamsController.getAllJams);
router.get('/:id', jamsController.getJamById);

// Creation (protected; creator auto-joins)
router.post('/', protect, validateJam, jamsController.createJam);

// Participation
router.post('/:id/participants', protect, jamsController.joinJam);
router.delete('/:id/participants', protect, jamsController.leaveJam);
router.get('/:id/participants', jamsController.getParticipants);
router.get('/:id/participants/me', protect, jamsController.checkMembership);

// Contributions
router.get('/:id/contributions', jamsController.getContributions);
router.post('/:id/contributions', protect, jamsController.createContribution);

// Leaderboard
router.get('/:id/leaderboard', jamsController.getLeaderboard);

module.exports = router;
