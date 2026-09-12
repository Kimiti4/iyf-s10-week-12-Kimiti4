/**
 * 🔹 Distribution Routes
 *
 * R3 [P1-9 U4]: the live frontend (distributionApi.js) calls
 * POST|DELETE /distribution/repost|share|remix. No distribution capability
 * exists on the backend (no table, no service). Per the MOCK DATA RULE
 * these return explicit 501 instead of fabricated repost state.
 * Repost-via-engage for posts is handled by PATCH /posts/:id/engage (U1).
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authPG');

const notImplemented = (req, res) => res.status(501).json({
  success: false,
  error: 'Distribution is not available',
  code: 'DISTRIBUTION_NOT_IMPLEMENTED'
});

router.post('/share', protect, notImplemented);
router.post('/repost', protect, notImplemented);
router.delete('/repost', protect, notImplemented);
router.post('/remix', protect, notImplemented);

module.exports = router;
