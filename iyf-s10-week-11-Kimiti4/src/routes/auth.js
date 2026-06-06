/**
 * 🔹 Authentication Routes
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllerPG'); // PostgreSQL version
const { protect } = require('../middleware/authPG'); // PostgreSQL version

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
