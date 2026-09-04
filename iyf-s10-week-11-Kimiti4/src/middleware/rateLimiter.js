/**
 * 🔹 Rate Limiter Middleware
 * Prevents abuse and DDoS attacks
 *
 * Rate limiting is BYPASSED in the test environment (NODE_ENV=test)
 * so contract tests can exercise validation + authorization without
 * hitting the per-IP limit. Each limiter still applies in production.
 */

const rateLimit = require('express-rate-limit');

const isTestEnv = () => process.env.NODE_ENV === 'test';

/**
 * General API rate limiter: 100 requests per 15 minutes
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip for health checks + test environment
    return isTestEnv() || req.path === '/api/health' || req.path === '/health';
  }
});

/**
 * Auth rate limiter: 5 requests per 15 minutes
 * Prevents brute force attacks on login/register
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv()
});

/**
 * Alert creation limiter: 10 alerts per hour per IP
 * Prevents spam
 */
const alertLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many alerts created. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTestEnv()
});

module.exports = {
  generalLimiter,
  authLimiter,
  alertLimiter
};
