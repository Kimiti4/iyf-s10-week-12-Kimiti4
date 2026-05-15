/**
 * 🔹 Application Constants
 * Centralized constants to replace magic numbers throughout the codebase
 */

// ===== TIME CONSTANTS (milliseconds) =====
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  
  // Alert refresh intervals
  ALERTS_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  HASHTAGS_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
  
  // Timestamp offsets for sample data
  RECENT_30_MIN: 30 * 60 * 1000, // 1800000
  RECENT_1_HOUR: 60 * 60 * 1000, // 3600000
  RECENT_1_5_HOURS: 90 * 60 * 1000, // 5400000
  RECENT_2_HOURS: 2 * 60 * 60 * 1000, // 7200000
  RECENT_3_HOURS: 3 * 60 * 60 * 1000, // 10800000
  RECENT_4_HOURS: 4 * 60 * 60 * 1000, // 14400000
};

// ===== DELAY CONSTANTS (milliseconds) =====
export const DELAY = {
  SHORT: 500,
  MEDIUM: 800,
  LONG: 1000,
  EXTRA_LONG: 2000,
  
  // Message auto-dismiss
  MESSAGE_DISMISS: 3000,
  
  // Celebration animation
  CELEBRATION_DURATION: 2000,
  
  // Loading states
  LOADING_SIMULATION: 1000,
};

// ===== PAGINATION CONSTANTS =====
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  POSTS_PER_PAGE: 10,
  COMMENTS_PER_PAGE: 20,
};

// ===== VALIDATION CONSTANTS =====
export const VALIDATION = {
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PASSWORD_MIN_LENGTH: 8,
  POST_TITLE_MIN: 5,
  POST_TITLE_MAX: 200,
  POST_CONTENT_MIN: 10,
  POST_CONTENT_MAX: 5000,
  BIO_MAX_LENGTH: 500,
};

// ===== UI CONSTANTS =====
export const UI = {
  SIDEBAR_COLLAPSED_WIDTH: 80,
  SIDEBAR_EXPANDED_WIDTH: 250,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  
  // Animation durations
  ANIMATION_FAST: 150,
  ANIMATION_NORMAL: 300,
  ANIMATION_SLOW: 500,
};

// ===== API CONSTANTS =====
export const API = {
  DEFAULT_TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// ===== FILE UPLOAD CONSTANTS =====
export const UPLOAD = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

// ===== EMERGENCY ALERT CONSTANTS =====
export const ALERT_SEVERITY = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info',
};

export const ALERT_TYPES = {
  BLACKOUT: 'blackout',
  UNREST: 'unrest',
  TRAFFIC: 'traffic',
  WEATHER: 'weather',
  ACCIDENT: 'accident',
  AMBER: 'amber',
  HEALTH: 'health',
  INFRASTRUCTURE: 'infrastructure',
  COMMUNITY: 'community',
};

// ===== ROLE CONSTANTS =====
export const ROLES = {
  USER: 'user',
  FOUNDER: 'founder',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
};

// ===== ORGANIZATION TYPES =====
export const ORG_TYPES = {
  SCHOOL: 'school',
  UNIVERSITY: 'university',
  ESTATE: 'estate',
  CHURCH: 'church',
  NGO: 'ngo',
  SME: 'sme',
  COWORKING: 'coworking',
  COMMUNITY: 'community',
  YOUTH_GROUP: 'youth_group',
  PROFESSIONAL: 'professional',
};

// ===== NOTIFICATION TYPES =====
export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  MENTION: 'mention',
  SYSTEM: 'system',
};

// ===== THEME CONSTANTS =====
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// ===== LANGUAGE CONSTANTS =====
export const LANGUAGES = {
  ENGLISH: 'en',
  SWAHILI: 'sw',
};

// ===== FONT SIZE CONSTANTS =====
export const FONT_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

export default {
  TIME,
  DELAY,
  PAGINATION,
  VALIDATION,
  UI,
  API,
  UPLOAD,
  ALERT_SEVERITY,
  ALERT_TYPES,
  ROLES,
  ORG_TYPES,
  NOTIFICATION_TYPES,
  THEMES,
  LANGUAGES,
  FONT_SIZES,
};
