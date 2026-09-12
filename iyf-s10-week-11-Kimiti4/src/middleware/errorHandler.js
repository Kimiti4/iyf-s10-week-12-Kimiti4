/**
 * 🔹 Task 20.2: Error Handling Middleware
 */
class ApiError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, next) => {
  console.error('💥 Error:', err.stack);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        errors: err.errors,
        statusCode: err.statusCode
      }
    });
  }

  // JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid JSON', statusCode: 400 }
    });
  }

  // R4: malformed identifier (e.g. non-UUID in an :id path parameter).
  // Postgres raises 22P02 (invalid_text_representation). The resource cannot
  // exist under a malformed id, so this is a 404 — never a 500, and never
  // a driver message leak.
  if (err.code === '22P02') {
    return res.status(404).json({
      success: false,
      error: { message: 'Resource not found', statusCode: 404 }
    });
  }

  // Default 500
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'development'
    ? err.message
    : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = { errorHandler, ApiError };
