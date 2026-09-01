/**
 * ModerationQueueItem
 *
 * Single item in the moderation review queue.
 * Displays report details, content preview, and action buttons.
 *
 * @module components/trust/ModerationQueueItem
 */

import { FaFlag, FaUser, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { getReportReasonLabel, getReportStatusLabel, getContentStatusColor } from '../../domain/trust/trustUtils';
import { computeSeverity } from '../../domain/trust/trustRules';
import { MODERATION_SEVERITY } from '../../domain/trust/trustTypes';

const SEVERITY_STYLES = {
  [MODERATION_SEVERITY.LOW]: { color: '#6b7280', bg: '#f3f4f6' },
  [MODERATION_SEVERITY.MEDIUM]: { color: '#f59e0b', bg: '#fef3c7' },
  [MODERATION_SEVERITY.HIGH]: { color: '#f97316', bg: '#ffedd5' },
  [MODERATION_SEVERITY.CRITICAL]: { color: '#ef4444', bg: '#fee2e2' },
};

export default function ModerationQueueItem({ report, onAction }) {
  const severity = computeSeverity(report.reason, report.reportCount);
  const severityStyle = SEVERITY_STYLES[severity] || SEVERITY_STYLES[MODERATION_SEVERITY.LOW];

  return (
    <article className="moderation-queue-item" aria-label={`Report on ${report.targetType}`}>
      <div className="moderation-queue-header">
        <div className="moderation-queue-target">
          <span className="moderation-queue-type">{report.targetType}</span>
          <span className="moderation-queue-title">
            {report.targetTitle?.slice(0, 80) || 'Untitled'}
          </span>
        </div>
        <span
          className="moderation-queue-severity"
          style={{ color: severityStyle.color, backgroundColor: severityStyle.bg }}
          aria-label={`Severity: ${severity}`}
        >
          {severity === MODERATION_SEVERITY.CRITICAL && <FaExclamationTriangle aria-hidden="true" />}
          {severity}
        </span>
      </div>

      <div className="moderation-queue-meta">
        <span className="moderation-queue-reason">
          <FaFlag aria-hidden="true" /> {getReportReasonLabel(report.reason)}
        </span>
        <span className="moderation-queue-reports">
          {report.reportCount} report{report.reportCount !== 1 ? 's' : ''}
        </span>
        <span className="moderation-queue-reporter">
          <FaUser aria-hidden="true" /> {report.reporterName}
        </span>
        <span className="moderation-queue-time">
          <FaClock aria-hidden="true" /> {new Date(report.createdAt).toLocaleDateString()}
        </span>
      </div>

      {report.description && (
        <p className="moderation-queue-description">{report.description}</p>
      )}

      <div className="moderation-queue-status">
        <span className="moderation-status-badge" style={{ color: getContentStatusColor(report.status) }}>
          {getReportStatusLabel(report.status)}
        </span>
      </div>

      <div className="moderation-queue-actions">
        <button className="mod-action-btn dismiss" onClick={() => onAction(report.id, { action: 'dismiss' })} aria-label="Dismiss report">
          Dismiss
        </button>
        <button className="mod-action-btn warn" onClick={() => onAction(report.id, { action: 'warn' })} aria-label="Warn author">
          Warn
        </button>
        <button className="mod-action-btn limit" onClick={() => onAction(report.id, { action: 'limit' })} aria-label="Limit content">
          Limit
        </button>
        <button className="mod-action-btn remove" onClick={() => onAction(report.id, { action: 'remove' })} aria-label="Remove content">
          Remove
        </button>
      </div>
    </article>
  );
}
