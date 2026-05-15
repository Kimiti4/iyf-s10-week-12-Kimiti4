/**
 * 🔹 Posts Routes - Unified endpoints
 */
const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsControllerPG'); // PostgreSQL version
const commentsController = require('../controllers/commentsControllerPG'); // Comments controller
const { validatePost, validateComment } = require('../middleware/validate');
const { protect, optionalAuth } = require('../middleware/authPG'); // PostgreSQL version

// Public routes (can optionally show user info if authenticated)
router.get('/', optionalAuth, postsController.getAllPosts);
router.get('/:id', postsController.getPostById);

// Comment routes
router.get('/:id/comments', commentsController.getComments);
router.post('/:id/comments', protect, validateComment, commentsController.createComment);
router.delete('/:id/comments/:commentId', protect, commentsController.deleteComment);

// Protected routes (require JWT authentication)
router.post('/', protect, validatePost, postsController.createPost);
router.put('/:id', protect, validatePost, postsController.updatePost);
router.delete('/:id', protect, postsController.deletePost);
router.patch('/:id/like', protect, postsController.likePost);
router.patch('/:id/upvote', protect, postsController.upvotePost);


module.exports = router;
