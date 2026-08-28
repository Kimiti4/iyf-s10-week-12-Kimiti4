/**
 * 🔹 Logger Utility
 * Centralized logging with environment-aware behavior
 * - Development: Full logging enabled
 * - Production: Only errors logged (console.log/warn disabled)
 */

const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';

const logger = {
  /**
   * Log informational messages (dev only)
   */
  info: (...args) => {
    if (isDevelopment) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Log warning messages (dev only)
   */
  warn: (...args) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Log error messages (always logged)
   */
  error: (...args) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * Log debug messages (dev only, verbose)
   */
  debug: (...args) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * Log API errors with context
   */
  apiError: (endpoint, error) => {
    if (isDevelopment) {
      console.error(`[API ERROR] ${endpoint}:`, error);
    }
  },

  /**
   * Log authentication events
   */
  auth: (event, details = {}) => {
    if (isDevelopment) {
      console.log(`[AUTH] ${event}:`, details);
    }
  },

  /**
   * Capture exceptions for monitoring (Sentry-ready)
   */
  captureException: (error, extra = {}) => {
    // Sentry-ready implementation
    const errorData = {
      message: error.message || error.toString(),
      stack: error.stack,
      extra,
      timestamp: new Date().toISOString()
    };
    
    // In production, this would be: Sentry.captureException(error, extra)
    console.error('[MONITORING] Exception captured:', errorData);
    
    // Mock sending to monitoring service
    if (!isDevelopment) {
      // fetch('/api/monitoring/errors', { method: 'POST', body: JSON.stringify(errorData) }).catch(() => {});
    }
  }
};

export default logger;
