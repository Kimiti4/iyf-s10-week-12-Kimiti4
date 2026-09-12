/**
 * 🔹 Activity Routes
 */
const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityControllerPG');
const { protect } = require('../middleware/authPG');

router.get('/me', protect, activityController.getMyActivity);

module.exports = router;
