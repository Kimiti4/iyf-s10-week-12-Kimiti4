/**
 * 🔹 Posts Routes - Unified endpoints
 */
const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const { validatePost, validateComment } = require('../middleware/validate');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes (can optionally show user info if authenticated)
router.get('/', optionalAuth, postsController.getAllPosts);
router.get('/:id', postsController.getPostById);
router.get('/:id/comments', postsController.getComments);

// Protected routes (require JWT authentication)
router.post('/', protect, validatePost, postsController.createPost);
router.put('/:id', protect, validatePost, postsController.updatePost);
router.delete('/:id', protect, postsController.deletePost);
router.patch('/:id/engage', protect, postsController.engagePost);

// Comments (nested resource)
router.post('/:id/comments', protect, validateComment, postsController.addComment);
router.delete('/:id/comments/:commentId', protect, postsController.deleteComment);

module.exports = router;
