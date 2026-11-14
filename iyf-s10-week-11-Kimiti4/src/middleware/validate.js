/**
 * Request validation middleware
 * Authorship for posts/comments is taken from JWT (req.user.id), never from body.
 */

const { ApiError } = require('./errorHandler');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const POST_CATEGORIES = ['mtaani', 'skill', 'farm', 'gig', 'alert'];
const JAM_STATUSES = ['draft', 'active', 'closed', 'archived'];

function fail(next, errors) {
  return next(
    new ApiError('Validation failed', 400, {
      code: 'VALIDATION_ERROR',
      errors,
    })
  );
}

const validatePost = (req, res, next) => {
  const { title, content, category } = req.body;
  const errors = [];

  if (!title || String(title).trim().length < 5) {
    errors.push('Title must be at least 5 characters');
  } else if (String(title).trim().length > 200) {
    errors.push('Title must be at most 200 characters');
  }

  if (!content || String(content).trim().length < 10) {
    errors.push('Content must be at least 10 characters');
  } else if (String(content).trim().length > 5000) {
    errors.push('Content must be at most 5000 characters');
  }

  if (!category || !POST_CATEGORIES.includes(category)) {
    errors.push(`Category must be one of: ${POST_CATEGORIES.join(', ')}`);
  }

  if (errors.length) return fail(next, errors);

  req.body.title = String(title).trim();
  req.body.content = String(content).trim();
  next();
};

const validateComment = (req, res, next) => {
  const { content } = req.body;
  if (!content || !String(content).trim()) {
    return fail(next, ['Comment content is required']);
  }
  if (String(content).trim().length > 2000) {
    return fail(next, ['Comment must be at most 2000 characters']);
  }
  req.body.content = String(content).trim();
  next();
};

const validateRegister = (req, res, next) => {
  const { email, password, username } = req.body;
  const errors = [];

  if (!username || String(username).trim().length < 2) {
    errors.push('Username must be at least 2 characters');
  } else if (String(username).trim().length > 30) {
    errors.push('Username must be at most 30 characters');
  }

  if (!email || !EMAIL_RE.test(String(email).trim())) {
    errors.push('Valid email is required');
  }

  if (!password || String(password).length < MIN_PASSWORD) {
    errors.push(`Password must be at least ${MIN_PASSWORD} characters`);
  }

  if (errors.length) return fail(next, errors);

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

  if (errors.length) return fail(next, errors);

  req.body.email = String(email).trim().toLowerCase();
  next();
};

/** Jam create / draft publish */
const validateJam = (req, res, next) => {
  const { title, prompt, participationTypes, status } = req.body;
  const errors = [];

  if (!title || !String(title).trim()) {
    errors.push('Title is required');
  } else if (String(title).trim().length > 120) {
    errors.push('Title must be at most 120 characters');
  }

  if (!prompt || !String(prompt).trim()) {
    errors.push('Prompt is required');
  } else if (String(prompt).trim().length > 2000) {
    errors.push('Prompt must be at most 2000 characters');
  }

  if (participationTypes !== undefined) {
    if (!Array.isArray(participationTypes) || participationTypes.length === 0) {
      errors.push('Select at least one participation type');
    }
  }

  if (status !== undefined && !JAM_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${JAM_STATUSES.join(', ')}`);
  }

  if (errors.length) return fail(next, errors);

  req.body.title = String(title).trim();
  req.body.prompt = String(prompt).trim();
  if (req.body.description) {
    req.body.description = String(req.body.description).trim();
  }
  next();
};

/** DM body */
const validateMessage = (req, res, next) => {
  const { content, text, body } = req.body;
  const raw = content ?? text ?? body;
  if (!raw || !String(raw).trim()) {
    return fail(next, ['Message content is required']);
  }
  if (String(raw).trim().length > 4000) {
    return fail(next, ['Message must be at most 4000 characters']);
  }
  const cleaned = String(raw).trim();
  req.body.content = cleaned;
  req.body.text = cleaned;
  next();
};

/** Change password */
const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword, password, confirmPassword } = req.body;
  const errors = [];
  const nextPw = newPassword || password;

  if (!currentPassword) {
    errors.push('Current password is required');
  }
  if (!nextPw || String(nextPw).length < MIN_PASSWORD) {
    errors.push(`New password must be at least ${MIN_PASSWORD} characters`);
  }
  if (confirmPassword !== undefined && confirmPassword !== nextPw) {
    errors.push('Password confirmation does not match');
  }

  if (errors.length) return fail(next, errors);
  next();
};

module.exports = {
  validatePost,
  validateComment,
  validateRegister,
  validateLogin,
  validateJam,
  validateMessage,
  validateChangePassword,
  POST_CATEGORIES,
};
