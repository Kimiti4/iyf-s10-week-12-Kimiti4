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
const { authLimiter, passwordResetLimiter, verificationLimiter, refreshLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/password-reset/request', passwordResetLimiter, authController.requestPasswordReset);
router.post('/password-reset/confirm', passwordResetLimiter, authController.resetPassword);
router.post('/logout', authController.logout);
// R5 [P0-7]: rotating refresh sessions (HttpOnly cookie transport).
router.post('/refresh', refreshLimiter, authController.refresh);

// Verification routes
router.post('/send-verification', verificationLimiter, authController.sendVerification);
router.post('/verify-code', verificationLimiter, authController.verifyCode);

// MFA routes (auth required)
router.post('/mfa/totp/enroll', protect, enrollTotp);
router.post('/mfa/totp/verify', protect, verifyTotp);

// OAuth is intentionally unavailable until a real provider integration is implemented.
// Do not expose mock-success authentication endpoints in production.

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
