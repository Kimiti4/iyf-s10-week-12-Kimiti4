/**
 * 🔹 Authentication & Authorization Middleware
 * JWT verification, role-based access control
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: Verify JWT and attach user to request
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check Authorization header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
        hint: 'Include header: Authorization: Bearer <token>'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user (exclude password)
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User no longer exists'
      });
    }
    
    // Attach user to request
    req.user = user;
    next();
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired' });
    }
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
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

/**
 * Check if user owns a resource (for post/comment authorization)
 */
const isOwner = (Model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params[idParam]);
      
      if (!resource) {
        return res.status(404).json({ success: false, error: 'Resource not found' });
      }
      
      // Allow admins or owners
      if (req.user.role === 'admin' || resource.author?.toString() === req.user._id.toString()) {
        req.resource = resource;
        return next();
      }
      
      return res.status(403).json({
        success: false,
        error: 'You can only modify your own content'
      });
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { protect, optionalAuth, restrictTo, isOwner };
