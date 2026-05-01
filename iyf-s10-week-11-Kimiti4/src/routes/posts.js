/**
 * 🔹 Posts Routes - Unified endpoints
 */
const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const { validatePost, validateComment } = require('../middleware/validate');
const requireAuth = require('../middleware/requireAuth');

// Public routes
router.get('/', postsController.getAllPosts);
router.get('/:id', postsController.getPostById);
router.get('/:id/comments', postsController.getComments); // Daily Challenge Day 5

// Protected routes (require auth simulation)
router.post('/', requireAuth, validatePost, postsController.createPost);
router.put('/:id', requireAuth, validatePost, postsController.updatePost);
router.delete('/:id', requireAuth, postsController.deletePost);
router.patch('/:id/engage', postsController.engagePost);

// Comments (nested resource - Daily Challenge Day 5)
router.post('/:id/comments', requireAuth, validateComment, postsController.addComment);
router.delete('/:id/comments/:commentId', requireAuth, postsController.deleteComment);

module.exports = router;
