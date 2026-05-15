/**
 * 🔹 Users Routes
 */
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersControllerPG'); // PostgreSQL version
const { protect, restrictTo } = require('../middleware/authPG'); // PostgreSQL version

// Public routes
router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);

// Protected routes
router.get('/me', protect, usersController.getMyProfile);
router.put('/profile', protect, usersController.updateProfile);
router.get('/stats/:id?', protect, usersController.getUserStats);

// Admin routes
router.put('/role/:userId', protect, restrictTo('admin', 'founder'), usersController.updateUserRole);
router.post('/ban/:userId', protect, restrictTo('admin', 'founder'), usersController.banUser);
router.post('/unban/:userId', protect, restrictTo('admin', 'founder'), usersController.unbanUser);

module.exports = router;
