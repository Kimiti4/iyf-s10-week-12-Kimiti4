const express = require('express');
const router = express.Router();
const controller = require('../controllers/contentReportsController');
const { protect, restrictTo } = require('../middleware/authPG');
const { generalLimiter } = require('../middleware/rateLimiter');

router.post('/', protect, generalLimiter, controller.createReport);
router.get('/', protect, restrictTo('admin', 'moderator', 'founder'), controller.listReports);
router.patch('/:id', protect, restrictTo('admin', 'moderator', 'founder'), controller.reviewReport);

module.exports = router;
