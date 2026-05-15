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
    console.error(`[API ERROR] ${endpoint}:`, error);
  },

  /**
   * Log authentication events
   */
  auth: (event, details = {}) => {
    if (isDevelopment) {
      console.log(`[AUTH] ${event}:`, details);
    }
  }
};

export default logger;
