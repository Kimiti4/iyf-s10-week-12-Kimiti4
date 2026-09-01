/**
 * Trust & Safety Types
 *
 * Canonical enums for content moderation, user safety, and trust.
 * Single source of truth — no scattered booleans.
 *
 * @module domain/trust/trustTypes
 */

// ===== CONTENT STATUS =====
// Canonical lifecycle state for all user-generated content.
// Replaces scattered isDeleted/isHidden/isReported booleans.

export const CONTENT_STATUS = {
  ACTIVE: 'active',
  UNDER_REVIEW: 'under_review',
  LIMITED: 'limited',
  REMOVED: 'removed',
  RESTORED: 'restored',
};

// ===== CONTENT TYPE (reportable targets) =====

export const REPORTABLE_TYPE = {
  POST: 'post',
  REEL: 'reel',
  JAM: 'jam',
  COMMENT: 'comment',
  PROFILE: 'profile',
  REMIX: 'remix',
  REPOST: 'repost',
};

// ===== REPORT REASON =====

export const REPORT_REASON = {
  SPAM: 'spam',
  HARASSMENT: 'harassment',
  HATE: 'hate',
  VIOLENCE: 'violence',
  SEXUAL_CONTENT: 'sexual_content',
  MISINFORMATION: 'misinformation',
  SCAM: 'scam',
  COPYRIGHT: 'copyright',
  IMPERSONATION: 'impersonation',
  OTHER: 'other',
};

// ===== REPORT STATUS =====

export const REPORT_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
};

// ===== MODERATION ACTION =====

export const MODERATION_ACTION = {
  DISMISS: 'dismiss',
  WARN: 'warn',
  LIMIT: 'limit',
  REMOVE: 'remove',
  RESTORE: 'restore',
  ESCALATE: 'escalate',
};

// ===== USER SAFETY ACTIONS =====

export const SAFETY_ACTION = {
  BLOCK: 'block',
  UNBLOCK: 'unblock',
  MUTE: 'mute',
  UNMUTE: 'unmute',
  RESTRICT: 'restrict',
  UNRESTRICT: 'unrestrict',
};

// ===== MODERATION SEVERITY (for queue prioritization) =====

export const MODERATION_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// ===== USER MODERATION STATE =====

export const USER_MODERATION_STATE = {
  ACTIVE: 'active',
  WARNED: 'warned',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
};
