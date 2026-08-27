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

// Verification routes
router.post('/send-verification', authController.sendVerification);
router.post('/verify-code', authController.verifyCode);

// OAuth routes (Scaffolded)
router.get('/google', (req, res) => {
    // Scaffold: Redirect to Google OAuth URL (normally handled by Passport)
    res.json({ success: true, message: "Redirecting to Google OAuth (Mock)" });
});
router.get('/google/callback', (req, res) => {
    // Scaffold: Handle OAuth callback
    res.json({ success: true, message: "Google OAuth callback successful" });
});

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
