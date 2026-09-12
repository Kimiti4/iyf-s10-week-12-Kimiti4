const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authPG'); // R1: P0-4

// R1 [P0-4]: Tiannara is a privileged service. Authentication alone is
// insufficient; ordinary users must not be able to invoke moderation,
// fact-checking, or mental-health endpoints.
//
// R3 [P1-3]: the previous keyword-based mock bodies are removed per the
// MOCK DATA RULE. Until the real Tiannara capability is integrated, each
// endpoint truthfully reports UNAVAILABLE (501). For the fail-closed
// moderation path used during post creation, see tiannaraService (P1-4).
router.use(protect, restrictTo('admin', 'moderator', 'founder'));

/**
 *  Tiannara AI - Mental Health Support (explicitly unavailable in R3)
 */
router.post('/mental-health', async (req, res) => {
  return res.status(501).json({
    success: false,
    error: 'Tiannara mental-health support is not available',
    code: 'TIANNARA_UNAVAILABLE'
  });
});

/**
 *  Tiannara AI - Fact Checking (explicitly unavailable in R3)
 */
router.post('/fact-check', async (req, res) => {
  return res.status(501).json({
    success: false,
    error: 'Tiannara fact-checking is not available',
    code: 'TIANNARA_UNAVAILABLE'
  });
});

/**
 *  Tiannara AI - Content Moderation (explicitly unavailable in R3)
 */
router.post('/moderate', async (req, res) => {
  return res.status(501).json({
    success: false,
    error: 'Tiannara moderation is not available',
    code: 'TIANNARA_UNAVAILABLE'
  });
});

module.exports = router;
