/**
 * Shared time formatting utilities.
 *
 * @module utils/formatTime
 */

/**
 * Format a date string to relative time (e.g., "5m", "3h", "2d").
 * @param {string} dateString - ISO date string
 * @returns {string}
 */
export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const seconds = Math.floor(diffMs / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
}

/**
 * Format a date string to relative time with "ago" suffix.
 * @param {string} dateString - ISO date string
 * @returns {string}
 */
export function formatRelativeTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const seconds = Math.floor(diffMs / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

/**
 * Format milliseconds to mm:ss.
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
