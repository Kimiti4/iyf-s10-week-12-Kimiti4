/**
 * 🔹 Story Routes
 */
const express = require('express');
const router = express.Router();
const storiesController = require('../controllers/storiesControllerPG');
const { protect } = require('../middleware/authPG');

router.get('/me', protect, storiesController.getMyStories);
router.post('/', protect, storiesController.createStory);
router.get('/user/:userId', protect, storiesController.getUserStories);
router.delete('/:id', protect, storiesController.deleteStory);

module.exports = router;
