/**
 * Rate limiters — bypassed when NODE_ENV=test
 */

const rateLimit = require('express-rate-limit');

const isTestEnv = () => process.env.NODE_ENV === 'test';

const jsonMessage = (message, code = 'RATE_LIMITED') => ({
  success: false,
  error: {
    message,
    code,
    statusCode: 429,
  },
});

/** General API: 200 requests / 15 min per IP */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_GENERAL_MAX) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many requests from this IP. Please try again later.'),
  skip: (req) => isTestEnv() || req.path === '/health' || req.path === '/api/health',
});

/** Auth (login/register): 10 attempts / 15 min per IP */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many authentication attempts. Please try again later.'),
  skip: () => isTestEnv(),
});

/** Alert create: 20 / hour per IP */
const alertLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_ALERT_MAX) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many alerts created. Please try again later.'),
  skip: () => isTestEnv(),
});

/** Verification / MFA: 5 / 15 min per IP */
const verificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_VERIFY_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many verification attempts. Please try again later.'),
  skip: () => isTestEnv(),
});

/** Message send: 60 / 15 min per IP */
const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MESSAGE_MAX) || 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Too many messages sent. Please slow down.'),
  skip: () => isTestEnv(),
});

module.exports = {
  generalLimiter,
  authLimiter,
  alertLimiter,
  verificationLimiter,
  messageLimiter,
};
