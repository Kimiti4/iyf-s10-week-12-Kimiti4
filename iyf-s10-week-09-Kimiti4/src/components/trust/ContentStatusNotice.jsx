/**
 * ContentStatusNotice
 *
 * Renders a moderation status notice on content that is not ACTIVE.
 * Shown to content owners and moderators to explain why content is limited/removed.
 *
 * @module components/trust/ContentStatusNotice
 */

import { FaEyeSlash, FaBan, FaClock, FaShieldAlt } from 'react-icons/fa';
import { CONTENT_STATUS } from '../../domain/trust/trustTypes';
import { getContentStatusColor } from '../../domain/trust/trustUtils';
import { getContentNotice } from '../../domain/trust/trustRules';

const STATUS_ICONS = {
  [CONTENT_STATUS.UNDER_REVIEW]: FaClock,
  [CONTENT_STATUS.LIMITED]: FaEyeSlash,
  [CONTENT_STATUS.REMOVED]: FaBan,
};

export default function ContentStatusNotice({ status, reason, isOwner, authorId, currentUserId }) {
  if (!status || status === CONTENT_STATUS.ACTIVE || status === CONTENT_STATUS.RESTORED) {
    return null;
  }

  const isViewerOwner = isOwner || (currentUserId && authorId && currentUserId === authorId);
  const message = getContentNotice(status, reason, isViewerOwner);
  if (!message) return null;

  const Icon = STATUS_ICONS[status] || FaShieldAlt;
  const color = getContentStatusColor(status);

  return (
    <div
      className="content-status-notice"
      role="alert"
      style={{ borderLeftColor: color }}
    >
      <Icon className="content-status-icon" aria-hidden="true" style={{ color }} />
      <span className="content-status-text">{message}</span>
    </div>
  );
}
