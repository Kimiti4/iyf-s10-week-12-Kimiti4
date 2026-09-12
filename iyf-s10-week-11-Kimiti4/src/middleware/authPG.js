/**
 * 🔹 Authentication & Authorization Middleware - PostgreSQL Version
 * JWT verification, role-based access control
 *
 * R5 [P0-7]:
 *  - strict claim validation: signature + exp + iss + aud required.
 *    Pre-R5 tokens without iss/aud are rejected (all clients re-login once).
 *  - any JWT decode/verify failure normalizes to 401 (previously an
 *    altered-payload edge could surface as 500).
 *  - DB lookup failures still propagate to the error handler.
 */
const jwt = require('jsonwebtoken');
const { UserRepository } = require('../database');

const JWT_ISSUER = 'jamiilink';
const JWT_AUDIENCE = 'jamiilink-api';

function verifyAccessToken(token) {
  // Throws on any verification problem; callers normalize to 401.
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE
  });
}

function unauthorized(res, error) {
  return res.status(401).json({ success: false, error });
}

/**
 * Protect routes: Verify JWT and attach user to request
 */
const protect = async (req, res, next) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return unauthorized(res, 'Access denied. No token provided.');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    if (error && error.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token expired');
    }
    // R5: every other JWT failure (bad signature, malformed, alg mismatch,
    // missing/wrong iss/aud, tampered payload) is a 401, never a 500.
    return unauthorized(res, 'Invalid token');
  }

  try {
    // Get user from database
    const user = await UserRepository.findById(decoded.id);

    if (!user) {
      return unauthorized(res, 'User no longer exists');
    }

    // Attach user to request
    req.user = user;
    req.auth = { jti: decoded.jti || null };
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional auth: Attach user if token exists, continue if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization?.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = verifyAccessToken(token);
        req.user = await UserRepository.findById(decoded.id);
        if (req.user) req.auth = { jti: decoded.jti || null };
      } catch {
        // Invalid token on an optional route: continue unauthenticated.
      }
    }
    next();
  } catch {
    // Continue without user
    next();
  }
};

/**
 * Restrict access to specific roles
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, restrictTo };
module.exports.JWT_ISSUER = JWT_ISSUER;
module.exports.JWT_AUDIENCE = JWT_AUDIENCE;
