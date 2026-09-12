/**
 * 🏆 Reputation Routes
 * Endpoints for reputation, badges, and feedback
 *
 * R3 [P1-8]: previously unmounted AND importing non-existent `{ auth,
 * checkAuth }` from non-PG middleware/auth (would crash if mounted).
 * Rewired to canonical authPG. Per-user GETs require protect; the
 * leaderboard aggregates stay public (like /metrics/platform).
 */

const express = require('express');
const router = express.Router();
const reputationController = require('../controllers/reputationController');
const { protect } = require('../middleware/authPG');

// ============================================
// PUBLIC ENDPOINTS (aggregates only)
// ============================================

/**
 * GET /api/reputation/leaderboard/all
 * Get global leaderboard
 */
router.get('/leaderboard/all', async (req, res) => {
  try {
    await reputationController.getLeaderboard(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/reputation/leaderboard/:tier
 * Get leaderboard by tier
 */
router.get('/leaderboard/:tier', async (req, res) => {
  try {
    const { tier } = req.params;
    req.query.tier = tier;
    await reputationController.getLeaderboard(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PROTECTED ENDPOINTS (per-user data)
// ============================================

/**
 * GET /api/reputation/export
 * Export Reputation Passport
 */
router.get('/export', protect, async (req, res) => {
  try {
    await reputationController.exportPassport(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/reputation/:userId
 * Get user's reputation profile
 */
router.get('/:userId', protect, async (req, res) => {
  try {
    await reputationController.getUserReputation(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/reputation/:userId/badges
 * Get user's badges
 */
router.get('/:userId/badges', protect, async (req, res) => {
  try {
    await reputationController.getUserBadges(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/reputation/:userId/feedback
 * Get feedback received
 */
router.get('/:userId/feedback', protect, async (req, res) => {
  try {
    await reputationController.getUserFeedback(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/reputation/:userId/ledger
 * Get reputation events ledger
 */
router.get('/:userId/ledger', protect, async (req, res) => {
  try {
    await reputationController.getReputationLedger(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reputation/feedback/submit
 * Submit feedback for a user
 */
router.post('/feedback/submit', protect, async (req, res) => {
  try {
    await reputationController.submitFeedback(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/reputation/contribution/log
 * Log a contribution
 */
router.post('/contribution/log', protect, async (req, res) => {
  try {
    await reputationController.logContribution(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
