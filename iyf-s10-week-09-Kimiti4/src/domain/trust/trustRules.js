/**
 * Trust & Safety Rules
 *
 * Pure business logic for moderation decisions.
 * No React, no API calls — domain only.
 *
 * @module domain/trust/trustRules
 */

import { CONTENT_STATUS, REPORT_STATUS, MODERATION_SEVERITY } from './trustTypes';

// ===== CONTENT VISIBILITY =====

/**
 * Determine if content should be visible in feeds and discovery.
 * @param {string} status - CONTENT_STATUS value
 * @param {string} currentUserId - viewing user
 * @param {string} contentAuthorId - content owner
 * @returns {boolean}
 */
export function isContentVisible(status, currentUserId, contentAuthorId) {
  if (status === CONTENT_STATUS.REMOVED) return false;
  // Content owners always see their own content with a notice
  if (status === CONTENT_STATUS.LIMITED && currentUserId !== contentAuthorId) return false;
  if (status === CONTENT_STATUS.UNDER_REVIEW && currentUserId !== contentAuthorId) return false;
  return true;
}

/**
 * Get the appropriate notice message for non-active content.
 * @param {string} status - CONTENT_STATUS value
 * @param {string} reason - report reason or moderation reason
 * @param {boolean} isOwner - whether the viewer is the content owner
 * @returns {string|null} notice message or null if content is active
 */
export function getContentNotice(status, reason, isOwner) {
  switch (status) {
    case CONTENT_STATUS.UNDER_REVIEW:
      return isOwner
        ? 'Your content is under review. It will be visible again once reviewed.'
        : 'This content is under review.';
    case CONTENT_STATUS.LIMITED:
      return isOwner
        ? 'Your content has been limited. It may not appear in feeds or search.'
        : null; // Hidden from non-owners
    case CONTENT_STATUS.REMOVED:
      return isOwner
        ? 'Your content has been removed for a policy violation.'
        : 'This content has been removed.';
    case CONTENT_STATUS.RESTORED:
      return null; // Treat as active
    default:
      return null;
  }
}

// ===== REPORT VALIDATION =====

/**
 * Validate whether a report can be submitted.
 * @param {Object} report - { targetType, targetId, reason, reporterId }
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateReport(report) {
  if (!report.targetType) return { valid: false, error: 'Target type is required.' };
  if (!report.targetId) return { valid: false, error: 'Target ID is required.' };
  if (!report.reason) return { valid: false, error: 'A reason is required.' };
  if (!report.reporterId) return { valid: false, error: 'You must be logged in to report.' };
  if (report.targetId === report.reporterId) {
    return { valid: false, error: 'You cannot report your own content.' };
  }
  return { valid: true };
}

// ===== MODERATION QUEUE PRIORITIZATION =====

/**
 * Compute report severity based on reason and report count.
 * @param {string} reason - REPORT_REASON value
 * @param {number} reportCount - number of reports for this content
 * @returns {string} MODERATION_SEVERITY value
 */
export function computeSeverity(reason, reportCount) {
  const HIGH_SEVERITY_REASONS = ['violence', 'sexual_content', 'hate'];
  const MEDIUM_SEVERITY_REASONS = ['harassment', 'misinformation', 'scam'];

  if (HIGH_SEVERITY_REASONS.includes(reason) || reportCount >= 5) {
    return MODERATION_SEVERITY.CRITICAL;
  }
  if (MEDIUM_SEVERITY_REASONS.includes(reason) || reportCount >= 3) {
    return MODERATION_SEVERITY.HIGH;
  }
  if (reportCount >= 2) {
    return MODERATION_SEVERITY.MEDIUM;
  }
  return MODERATION_SEVERITY.LOW;
}

// ===== PROVENANCE-AWARE MODERATION =====

/**
 * Determine the effect of removing original content on its derivatives.
 *
 * @param {Object} context - { originalStatus, derivativeKind, derivativeStatus }
 * @returns {{ action: string, reason: string }}
 */
export function computeDerivativeEffect(context) {
  const { originalStatus, derivativeKind, derivativeStatus } = context;

  if (originalStatus !== CONTENT_STATUS.REMOVED) {
    return { action: 'none', reason: 'Original is not removed.' };
  }

  // Reposts: if original is removed, reposts become orphaned
  if (derivativeKind === 'repost') {
    return {
      action: 'hide',
      reason: 'Repost hidden because the original content was removed.',
    };
  }

  // Remixes: if original is removed, remix is hidden but preserved
  // (remix is a new creative work with attribution)
  if (derivativeKind === 'remix') {
    return {
      action: 'hide_attribution',
      reason: 'Remix attribution removed because the original content was removed.',
    };
  }

  return { action: 'none', reason: 'No derivative effect.' };
}

// ===== USER SAFETY =====

/**
 * Determine if a user can interact with content based on block/mute state.
 * @param {Object} context - { isBlockedByAuthor, isMutedByAuthor, isBlockingAuthor }
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canInteract(context) {
  const { isBlockedByAuthor, isMutedByAuthor, isBlockingAuthor } = context;

  if (isBlockingAuthor) {
    return { allowed: false, reason: 'You have blocked this user.' };
  }
  if (isBlockedByAuthor) {
    return { allowed: false, reason: 'This user has blocked you.' };
  }
  if (isMutedByAuthor) {
    return { allowed: false, reason: 'You have muted this user.' };
  }
  return { allowed: true };
}

// ===== MODERATION ACTION VALIDATION =====

/**
 * Validate whether a moderator can perform a specific action.
 * @param {Object} context - { moderatorRole, action, contentAuthorId, moderatorId }
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateModerationAction(context) {
  const { moderatorRole, action, contentAuthorId, moderatorId } = context;

  if (!moderatorRole || !['admin', 'moderator'].includes(moderatorRole)) {
    return { valid: false, error: 'Insufficient permissions.' };
  }
  if (moderatorId === contentAuthorId) {
    return { valid: false, error: 'You cannot moderate your own content.' };
  }
  if (!action) {
    return { valid: false, error: 'Action is required.' };
  }
  return { valid: true };
}
