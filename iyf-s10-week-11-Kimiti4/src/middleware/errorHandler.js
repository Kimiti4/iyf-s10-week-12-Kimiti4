/**
 * Central error handler — consistent JSON contract for all API errors.
 *
 * Success shape: { success: true, data, ... }
 * Error shape:   { success: false, error: { message, code, statusCode, errors? } }
 */

class ApiError extends Error {
  constructor(message, statusCode = 500, options = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = options.code || statusFromCode(statusCode);
    this.errors = options.errors || null;
    this.isOperational = true;
  }
}

function statusFromCode(statusCode) {
  const map = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'UNPROCESSABLE',
    429: 'RATE_LIMITED',
    500: 'INTERNAL_ERROR',
    503: 'SERVICE_UNAVAILABLE',
  };
  return map[statusCode] || 'ERROR';
}

function sendError(res, statusCode, message, code, extra = {}) {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: code || statusFromCode(statusCode),
      statusCode,
      ...extra,
    },
  });
}

const errorHandler = (err, req, res, next) => {
  // Avoid double-send
  if (res.headersSent) {
    return next(err);
  }

  if (process.env.NODE_ENV !== 'test') {
    console.error('API Error:', err.message, err.code || '', err.stack?.split('\n')[1] || '');
  }

  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.message, err.code, {
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  // express-rate-limit
  if (err.status === 429 || err.statusCode === 429) {
    return sendError(
      res,
      429,
      err.message || 'Too many requests. Please try again later.',
      'RATE_LIMITED'
    );
  }

  // JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'Invalid JSON body', 'INVALID_JSON');
  }

  // Payload too large
  if (err.type === 'entity.too.large') {
    return sendError(res, 413, 'Request body too large', 'PAYLOAD_TOO_LARGE');
  }

  // Postgres: invalid text representation (e.g. bad UUID) → 404
  if (err.code === '22P02') {
    return sendError(res, 404, 'Resource not found', 'NOT_FOUND');
  }

  // Postgres unique violation
  if (err.code === '23505') {
    return sendError(res, 409, 'Resource already exists', 'CONFLICT');
  }

  // Postgres foreign key
  if (err.code === '23503') {
    return sendError(res, 400, 'Related resource not found', 'BAD_REQUEST');
  }

  // CORS rejection
  if (err.message === 'Not allowed by CORS') {
    return sendError(res, 403, 'Origin not allowed', 'CORS_BLOCKED');
  }

  const statusCode = err.statusCode || err.status || 500;
  const isDev = process.env.NODE_ENV === 'development';
  const message =
    statusCode >= 500 && !isDev
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return sendError(res, statusCode, message, statusFromCode(statusCode), {
    ...(isDev && err.stack ? { stack: err.stack } : {}),
  });
};

module.exports = { errorHandler, ApiError, sendError };
