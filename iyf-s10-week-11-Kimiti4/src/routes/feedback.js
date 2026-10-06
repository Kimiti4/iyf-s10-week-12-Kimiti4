const express = require('express');
const router = express.Router();
const { submitFeedback } = require('../controllers/feedbackController');
const { feedbackLimiter } = require('../middleware/rateLimiter');

router.post('/', feedbackLimiter, submitFeedback);

module.exports = router;
