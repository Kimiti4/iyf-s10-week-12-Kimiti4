/**
 * 🔹 Authentication Routes
 *
 * R2 [P0-5]: /mfa/totp/enroll + /mfa/totp/verify are server-authoritative
 * TOTP enrollment/verification. The client never supplies the authoritative
 * secret for verification.
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllerPG'); // PostgreSQL version
const { enrollTotp, verifyTotp } = require('../controllers/mfaControllerPG');
const { protect } = require('../middleware/authPG'); // PostgreSQL version

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
// R5 [P0-7]: rotating refresh sessions (HttpOnly cookie transport).
router.post('/refresh', authController.refresh);

// Verification routes
router.post('/send-verification', authController.sendVerification);
router.post('/verify-code', authController.verifyCode);

// MFA routes (auth required)
router.post('/mfa/totp/enroll', protect, enrollTotp);
router.post('/mfa/totp/verify', protect, verifyTotp);

// OAuth routes (Scaffolded)
router.get('/google', (req, res) => {
    res.json({ success: true, message: "Redirecting to Google OAuth (Mock)" });
});
router.get('/google/callback', (req, res) => {
    res.json({ success: true, message: "Google OAuth callback successful" });
});

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
