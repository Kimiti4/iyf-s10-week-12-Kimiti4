/**
 * 🔹 Users Routes
 *
 * R1 authorization policy:
 *   GET  /api/users                 -> protect + restrictTo('admin','founder')  [P0-1]
 *   GET  /api/users/:id             -> protect (public-minimal shape for non-owners)  [P0-2]
 *   GET  /api/users/me              -> protect (own profile, full)
 *   PUT  /api/users/profile         -> protect
 *   GET  /api/users/stats/:id?      -> protect; owner/admin/founder only  [P2-8]
 *   PUT  /api/users/role/:userId    -> protect + restrictTo('admin','founder')
 *   POST /api/users/ban/:userId     -> protect + restrictTo('admin','founder')
 *   POST /api/users/unban/:userId   -> protect + restrictTo('admin','founder')
 */
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersControllerPG'); // PostgreSQL version
const { protect, restrictTo } = require('../middleware/authPG'); // PostgreSQL version

// Privileged routes
router.get('/', protect, restrictTo('admin', 'founder'), usersController.getAllUsers);
router.put('/role/:userId', protect, restrictTo('admin', 'founder'), usersController.updateUserRole);
router.post('/ban/:userId', protect, restrictTo('admin', 'founder'), usersController.banUser);
router.post('/unban/:userId', protect, restrictTo('admin', 'founder'), usersController.unbanUser);

// Authenticated routes
router.get('/me', protect, usersController.getMyProfile);
router.put('/profile', protect, usersController.updateProfile);
router.get('/stats/:id?', protect, usersController.getUserStats);
router.get('/likes/me', protect, usersController.getLikedPosts);
router.get('/:userId/follow', protect, usersController.getFollowState);
router.post('/:userId/follow', protect, usersController.followUser);
router.delete('/:userId/follow', protect, usersController.unfollowUser);
router.get('/:id', protect, usersController.getUserById);

module.exports = router;
