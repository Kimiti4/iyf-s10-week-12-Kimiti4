/**
 * Authentication Routes
 *
 * Login/register use validateLogin / validateRegister (Phase 4).
 * MFA enrollment/verify require protect.
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllerPG');
const { enrollTotp, verifyTotp } = require('../controllers/mfaControllerPG');
const { protect } = require('../middleware/authPG');
const { validateLogin, validateRegister } = require('../middleware/validate');

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);

// Verification routes
router.post('/send-verification', authController.sendVerification);
router.post('/verify-code', authController.verifyCode);

// MFA routes (auth required)
router.post('/mfa/totp/enroll', protect, enrollTotp);
router.post('/mfa/totp/verify', protect, verifyTotp);

// OAuth scaffold (not production-ready)
router.get('/google', (req, res) => {
  res.status(501).json({
    success: false,
    error: { message: 'Google OAuth is not configured', code: 'NOT_IMPLEMENTED', statusCode: 501 },
  });
});
router.get('/google/callback', (req, res) => {
  res.status(501).json({
    success: false,
    error: { message: 'Google OAuth is not configured', code: 'NOT_IMPLEMENTED', statusCode: 501 },
  });
});

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
