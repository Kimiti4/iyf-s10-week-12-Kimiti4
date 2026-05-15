/**
 * 🔹 Comments Routes (nested under posts)
 */
const express = require('express');
const router = express.Router({ mergeParams: true }); // ✅ Merge postId from parent
const commentsController = require('../controllers/commentsControllerPG'); // PostgreSQL version
const { protect } = require('../middleware/authPG'); // PostgreSQL version

// Public: Get comments
router.get('/', commentsController.getComments);

// Protected: Create/delete comments
router.post('/', protect, commentsController.createComment);
router.delete('/:commentId', protect, commentsController.deleteComment);

module.exports = router;
