/**
 * Moderation Contract
 *
 * Canonical shapes for reports, moderation actions, and user safety records.
 * All services normalize backend responses to these shapes.
 *
 * @module contracts/moderationContract
 */

// ===== REPORT SHAPE =====

/**
 * @typedef {Object} NormalizedReport
 * @property {string} id
 * @property {string} targetType - post|reel|jam|comment|profile|remix|repost
 * @property {string} targetId
 * @property {string} targetTitle - preview text for display
 * @property {string} targetAuthorId
 * @property {string} targetAuthorName
 * @property {string} reporterId
 * @property {string} reporterName
 * @property {string} reason - REPORT_REASON value
 * @property {string} description - user-provided detail
 * @property {string} status - REPORT_STATUS value
 * @property {string} severity - MODERATION_SEVERITY value
 * @property {number} reportCount - total reports on this target
 * @property {string|null} moderatorId - who reviewed
 * @property {string|null} moderatorAction - MODERATION_ACTION value
 * @property {string|null} moderatorNote
 * @property {string} createdAt - ISO 8601
 * @property {string|null} resolvedAt - ISO 8601
 */

export function normalizeReport(raw) {
  if (!raw) return null;

  const reporter = raw.reporter || {};
  const targetAuthor = raw.targetAuthor || raw.target?.author || {};
  const moderator = raw.moderator || {};

  return {
    id: raw.id || raw._id || '',
    targetType: raw.targetType || raw.type || '',
    targetId: raw.targetId || raw.target?.id || '',
    targetTitle: raw.targetTitle || raw.target?.title || raw.target?.content?.slice(0, 100) || '',
    targetAuthorId: raw.targetAuthorId || targetAuthor._id || targetAuthor.id || '',
    targetAuthorName: raw.targetAuthorName || targetAuthor.username || '',
    reporterId: raw.reporterId || reporter._id || reporter.id || '',
    reporterName: raw.reporterName || reporter.username || '',
    reason: raw.reason || 'other',
    description: raw.description || '',
    status: raw.status || 'pending',
    severity: raw.severity || 'low',
    reportCount: raw.reportCount ?? 1,
    moderatorId: raw.moderatorId || moderator._id || moderator.id || null,
    moderatorAction: raw.moderatorAction || null,
    moderatorNote: raw.moderatorNote || null,
    createdAt: raw.createdAt || new Date().toISOString(),
    resolvedAt: raw.resolvedAt || null,
  };
}

// ===== USER SAFETY RECORD SHAPE =====

/**
 * @typedef {Object} NormalizedSafetyRecord
 * @property {string} id
 * @property {string} userId - who performed the action
 * @property {string} targetUserId - who is affected
 * @property {string} targetUsername
 * @property {string} action - block|mute|restrict
 * @property {string} createdAt - ISO 8601
 */

export function normalizeSafetyRecord(raw) {
  if (!raw) return null;

  const targetUser = raw.targetUser || {};

  return {
    id: raw.id || raw._id || '',
    userId: raw.userId || '',
    targetUserId: raw.targetUserId || targetUser._id || targetUser.id || '',
    targetUsername: raw.targetUsername || targetUser.username || '',
    action: raw.action || '',
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

// ===== MODERATION ACTION LOG SHAPE =====

/**
 * @typedef {Object} NormalizedModerationLog
 * @property {string} id
 * @property {string} moderatorId
 * @property {string} moderatorName
 * @property {string} targetType
 * @property {string} targetId
 * @property {string} action - MODERATION_ACTION value
 * @property {string} reason
 * @property {string|null} note
 * @property {string} createdAt
 */

export function normalizeModerationLog(raw) {
  if (!raw) return null;

  const moderator = raw.moderator || {};

  return {
    id: raw.id || raw._id || '',
    moderatorId: raw.moderatorId || moderator._id || moderator.id || '',
    moderatorName: raw.moderatorName || moderator.username || '',
    targetType: raw.targetType || '',
    targetId: raw.targetId || '',
    action: raw.action || '',
    reason: raw.reason || '',
    note: raw.note || null,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}
