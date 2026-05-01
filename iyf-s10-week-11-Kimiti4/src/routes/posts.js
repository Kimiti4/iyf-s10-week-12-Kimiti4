/**
 * 🔹 Posts Routes - Week 11
 */
const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const { validatePost } = require('../middleware/validate');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', postsController.getAllPosts);
router.get('/:id', postsController.getPostById);

// Protected routes (require JWT auth)
router.post('/', protect, validatePost, postsController.createPost);
router.put('/:id', protect, validatePost, postsController.updatePost);
router.delete('/:id', protect, postsController.deletePost);
router.patch('/:id/engage', protect, postsController.engagePost);

module.exports = router;
