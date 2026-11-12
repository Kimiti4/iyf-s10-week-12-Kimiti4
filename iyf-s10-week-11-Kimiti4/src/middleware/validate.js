/**
 * Request validation middleware
 * Authorship for posts/comments is taken from JWT (req.user.id), never from body.
 */

const { ApiError } = require('./errorHandler');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const validatePost = (req, res, next) => {
  const { title, content, category } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) errors.push('Title must be at least 3 characters');
  if (!content || content.trim().length < 10) errors.push('Content must be at least 10 characters');

  const validCategories = ['mtaani', 'skill', 'farm', 'gig', 'alert'];
  if (!category || !validCategories.includes(category)) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}`);
  }

  if (errors.length > 0) {
    return next(new ApiError('Validation failed', 400, { code: 'VALIDATION_ERROR', errors }));
  }

  req.body.title = title.trim();
  req.body.content = content.trim();
  next();
};

const validateComment = (req, res, next) => {
  const { content } = req.body;
  if (!content?.trim()) {
    return next(new ApiError('Comment content is required', 400, { code: 'VALIDATION_ERROR' }));
  }
  req.body.content = content.trim();
  next();
};

const validateRegister = (req, res, next) => {
  const { email, password, username } = req.body;
  const errors = [];

  if (!username || String(username).trim().length < 2) {
    errors.push('Username must be at least 2 characters');
  }
  if (!email || !EMAIL_RE.test(String(email).trim())) {
    errors.push('Valid email is required');
  }
  if (!password || String(password).length < MIN_PASSWORD) {
    errors.push(`Password must be at least ${MIN_PASSWORD} characters`);
  }

  if (errors.length > 0) {
    return next(new ApiError('Validation failed', 400, { code: 'VALIDATION_ERROR', errors }));
  }

  req.body.email = String(email).trim().toLowerCase();
  req.body.username = String(username).trim();
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !EMAIL_RE.test(String(email).trim())) {
    errors.push('Valid email is required');
  }
  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return next(new ApiError('Validation failed', 400, { code: 'VALIDATION_ERROR', errors }));
  }

  req.body.email = String(email).trim().toLowerCase();
  next();
};

module.exports = {
  validatePost,
  validateComment,
  validateRegister,
  validateLogin,
};
