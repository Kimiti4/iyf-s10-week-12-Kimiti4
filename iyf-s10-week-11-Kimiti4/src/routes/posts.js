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
router.get('/trending', postsController.getTrendingTags);
// R3 [P1-9 U2]: registered before `/:id` so it is not swallowed by it.
router.get('/saved', protect, (req, res) => res.status(501).json({
  success: false, error: 'Saved posts are not available', code: 'SAVE_NOT_IMPLEMENTED'
}));
router.get('/:id', postsController.getPostById);

// Comment routes
router.get('/:id/comments', commentsController.getComments);
router.post('/:id/comments', protect, validateComment, commentsController.createComment);
router.delete('/:id/comments/:commentId', protect, commentsController.deleteComment);
// R3 [P1-8/P1-9 U3]: nested comment-like (replaces the deleted flat
// routes/comments.js shape with a post-scoped path)
router.patch('/:id/comments/:commentId/like', protect, commentsController.likeComment);

// Protected routes (require JWT authentication)
router.post('/', protect, validatePost, postsController.createPost);
router.put('/:id', protect, validatePost, postsController.updatePost);
router.delete('/:id', protect, postsController.deletePost);
router.patch('/:id/like', protect, postsController.likePost);
router.patch('/:id/upvote', protect, postsController.upvotePost);
// R3 [P1-9 U1]: unified engage endpoint used by the live frontend
router.patch('/:id/engage', protect, postsController.engagePost);
// R3 [P1-9 U2]: saved-posts have no backing storage (R6 owns tables).
// Explicit 501s instead of fabricated save state.
router.post('/:id/save', protect, (req, res) => res.status(501).json({
  success: false, error: 'Saved posts are not available', code: 'SAVE_NOT_IMPLEMENTED'
}));
router.delete('/:id/save', protect, (req, res) => res.status(501).json({
  success: false, error: 'Saved posts are not available', code: 'SAVE_NOT_IMPLEMENTED'
}));


module.exports = router;
