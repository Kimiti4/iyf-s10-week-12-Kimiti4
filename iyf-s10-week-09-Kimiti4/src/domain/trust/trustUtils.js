/**
 * Trust & Safety Utilities
 *
 * Formatting, helpers, and pure transformations for moderation UI.
 *
 * @module domain/trust/trustUtils
 */

import {
  CONTENT_STATUS,
  REPORT_REASON,
  REPORT_STATUS,
  MODERATION_ACTION,
  REPORTABLE_TYPE,
} from './trustTypes';

// ===== STATUS DISPLAY =====

const STATUS_LABELS = {
  [CONTENT_STATUS.ACTIVE]: 'Active',
  [CONTENT_STATUS.UNDER_REVIEW]: 'Under Review',
  [CONTENT_STATUS.LIMITED]: 'Limited',
  [CONTENT_STATUS.REMOVED]: 'Removed',
  [CONTENT_STATUS.RESTORED]: 'Restored',
};

export function getContentStatusLabel(status) {
  return STATUS_LABELS[status] || status;
}

const STATUS_COLORS = {
  [CONTENT_STATUS.ACTIVE]: '#22c55e',
  [CONTENT_STATUS.UNDER_REVIEW]: '#f59e0b',
  [CONTENT_STATUS.LIMITED]: '#f97316',
  [CONTENT_STATUS.REMOVED]: '#ef4444',
  [CONTENT_STATUS.RESTORED]: '#3b82f6',
};

export function getContentStatusColor(status) {
  return STATUS_COLORS[status] || '#6b7280';
}

// ===== REASON DISPLAY =====

const REASON_LABELS = {
  [REPORT_REASON.SPAM]: 'Spam',
  [REPORT_REASON.HARASSMENT]: 'Harassment',
  [REPORT_REASON.HATE]: 'Hate speech',
  [REPORT_REASON.VIOLENCE]: 'Violence',
  [REPORT_REASON.SEXUAL_CONTENT]: 'Sexual content',
  [REPORT_REASON.MISINFORMATION]: 'Misinformation',
  [REPORT_REASON.SCAM]: 'Scam',
  [REPORT_REASON.COPYRIGHT]: 'Copyright violation',
  [REPORT_REASON.IMPERSONATION]: 'Impersonation',
  [REPORT_REASON.OTHER]: 'Other',
};

export function getReportReasonLabel(reason) {
  return REASON_LABELS[reason] || reason;
}

// ===== REPORT STATUS DISPLAY =====

const REPORT_STATUS_LABELS = {
  [REPORT_STATUS.PENDING]: 'Pending',
  [REPORT_STATUS.REVIEWING]: 'In Review',
  [REPORT_STATUS.RESOLVED]: 'Resolved',
  [REPORT_STATUS.DISMISSED]: 'Dismissed',
};

export function getReportStatusLabel(status) {
  return REPORT_STATUS_LABELS[status] || status;
}

// ===== ACTION DISPLAY =====

const ACTION_LABELS = {
  [MODERATION_ACTION.DISMISS]: 'Dismiss',
  [MODERATION_ACTION.WARN]: 'Warn',
  [MODERATION_ACTION.LIMIT]: 'Limit',
  [MODERATION_ACTION.REMOVE]: 'Remove',
  [MODERATION_ACTION.RESTORE]: 'Restore',
  [MODERATION_ACTION.ESCALATE]: 'Escalate',
};

export function getModerationActionLabel(action) {
  return ACTION_LABELS[action] || action;
}

// ===== TARGET TYPE DISPLAY =====

const TARGET_LABELS = {
  [REPORTABLE_TYPE.POST]: 'Post',
  [REPORTABLE_TYPE.REEL]: 'Reel',
  [REPORTABLE_TYPE.JAM]: 'Jam',
  [REPORTABLE_TYPE.COMMENT]: 'Comment',
  [REPORTABLE_TYPE.PROFILE]: 'Profile',
  [REPORTABLE_TYPE.REMIX]: 'Remix',
  [REPORTABLE_TYPE.REPOST]: 'Repost',
};

export function getReportTargetLabel(type) {
  return TARGET_LABELS[type] || type;
}

// ===== CONTENT STATUS HELPERS =====

export function isActiveStatus(status) {
  return status === CONTENT_STATUS.ACTIVE || status === CONTENT_STATUS.RESTORED;
}

export function isRemovedStatus(status) {
  return status === CONTENT_STATUS.REMOVED;
}

export function isUnderReview(status) {
  return status === CONTENT_STATUS.UNDER_REVIEW;
}

// ===== REPORT COUNT FORMATTING =====

export function formatReportCount(count) {
  if (count === 0) return 'No reports';
  if (count === 1) return '1 report';
  return `${count} reports`;
}
