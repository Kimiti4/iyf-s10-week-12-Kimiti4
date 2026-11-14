/**
 * Input validation — forms and client-side API payload checks
 */

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true, message: '' };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^(\+254|0)[17]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true, message: '' };
};

export const validateLength = (value, min, max, fieldName = 'Field') => {
  if (value.length < min) {
    return { valid: false, message: `${fieldName} must be at least ${min} characters` };
  }
  if (value.length > max) {
    return { valid: false, message: `${fieldName} must be no more than ${max} characters` };
  }
  return { valid: true, message: '' };
};

export const validateRegistration = (formData) => {
  const errors = {};

  const usernameCheck = validateRequired(formData.username, 'Username');
  if (!usernameCheck.valid) {
    errors.username = usernameCheck.message;
  } else if (!validateUsername(formData.username)) {
    errors.username = 'Username must be 3-30 characters, alphanumeric with underscores or hyphens';
  }

  const emailCheck = validateRequired(formData.email, 'Email');
  if (!emailCheck.valid) {
    errors.email = emailCheck.message;
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  const passwordCheck = validateRequired(formData.password, 'Password');
  if (!passwordCheck.valid) {
    errors.password = passwordCheck.message;
  } else {
    const passwordStrength = validatePassword(formData.password);
    if (!passwordStrength.valid) {
      errors.password = passwordStrength.message;
    }
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLogin = (formData) => {
  const errors = {};

  const emailCheck = validateRequired(formData.email, 'Email');
  if (!emailCheck.valid) {
    errors.email = emailCheck.message;
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  const passwordCheck = validateRequired(formData.password, 'Password');
  if (!passwordCheck.valid) {
    errors.password = passwordCheck.message;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/** Matches backend validatePost categories */
export const POST_CATEGORIES = ['mtaani', 'skill', 'farm', 'gig', 'alert'];

export const validatePost = (postData) => {
  const errors = {};

  const titleCheck = validateRequired(postData.title, 'Title');
  if (!titleCheck.valid) {
    errors.title = titleCheck.message;
  } else {
    const lengthCheck = validateLength(postData.title, 5, 200, 'Title');
    if (!lengthCheck.valid) {
      errors.title = lengthCheck.message;
    }
  }

  const contentCheck = validateRequired(postData.content, 'Content');
  if (!contentCheck.valid) {
    errors.content = contentCheck.message;
  } else {
    const lengthCheck = validateLength(postData.content, 10, 5000, 'Content');
    if (!lengthCheck.valid) {
      errors.content = lengthCheck.message;
    }
  }

  if (postData.category && !POST_CATEGORIES.includes(postData.category)) {
    errors.category = `Category must be one of: ${POST_CATEGORIES.join(', ')}`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const sanitizeObject = (obj, fieldsToSanitize) => {
  const sanitized = { ...obj };
  fieldsToSanitize.forEach((field) => {
    if (sanitized[field] && typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeInput(sanitized[field]);
    }
  });
  return sanitized;
};

export default {
  validateEmail,
  validatePassword,
  sanitizeInput,
  validateUsername,
  validatePhone,
  validateURL,
  validateRequired,
  validateLength,
  validateRegistration,
  validateLogin,
  validatePost,
  sanitizeObject,
  POST_CATEGORIES,
};
