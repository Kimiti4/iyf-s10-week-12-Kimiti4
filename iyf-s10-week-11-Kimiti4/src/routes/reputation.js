/**
 * 🏆 Reputation Routes
 * Endpoints for reputation, badges, and feedback
 */

const express = require('express');
const router = express.Router();
const reputationController = require('../controllers/reputationController');
const { auth, checkAuth } = require('../middleware/auth');

// ============================================
// PUBLIC ENDPOINTS (no auth required)
// ============================================

/**
 * GET /api/reputation/export
 * Export Reputation Passport
 */
router.get('/export', auth, async (req, res) => {
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
router.get('/:userId', async (req, res) => {
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
router.get('/:userId/badges', async (req, res) => {
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
router.get('/:userId/feedback', async (req, res) => {
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
router.get('/:userId/ledger', async (req, res) => {
  try {
    await reputationController.getReputationLedger(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

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
// PROTECTED ENDPOINTS (auth required)
// ============================================

/**
 * POST /api/reputation/feedback/submit
 * Submit feedback for a user
 */
router.post('/feedback/submit', auth, async (req, res) => {
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
router.post('/contribution/log', auth, async (req, res) => {
  try {
    await reputationController.logContribution(req, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
