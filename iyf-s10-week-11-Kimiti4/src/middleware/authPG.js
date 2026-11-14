/**
 * Authentication & Authorization — PostgreSQL
 * JWT: signature + exp + iss + aud required.
 */
const jwt = require('jsonwebtoken');
const { UserRepository } = require('../database');

const JWT_ISSUER = 'jamiilink';
const JWT_AUDIENCE = 'jamiilink-api';

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
  });
}

function unauthorized(res, message, code = 'UNAUTHORIZED') {
  return res.status(401).json({
    success: false,
    error: {
      message,
      code,
      statusCode: 401,
    },
  });
}

/**
 * Protect routes: Verify JWT and attach user to request
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return unauthorized(res, 'Access denied. No token provided.', 'NO_TOKEN');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (error) {
    if (error && error.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token expired', 'TOKEN_EXPIRED');
    }
    return unauthorized(res, 'Invalid token', 'INVALID_TOKEN');
  }

  try {
    const user = await UserRepository.findById(decoded.id);

    if (!user) {
      return unauthorized(res, 'User no longer exists', 'USER_GONE');
    }

    req.user = user;
    req.auth = { jti: decoded.jti || null };
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional auth: attach user if token valid, else continue
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
        // continue unauthenticated
      }
    }
    next();
  } catch {
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
        error: {
          message: 'You do not have permission to perform this action',
          code: 'FORBIDDEN',
          statusCode: 403,
        },
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, restrictTo };
module.exports.JWT_ISSUER = JWT_ISSUER;
module.exports.JWT_AUDIENCE = JWT_AUDIENCE;
