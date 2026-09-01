/**
 * ModerationBadge
 *
 * Small inline badge showing content moderation status.
 * Used in feed items, post headers, and moderation queue.
 *
 * @module components/trust/ModerationBadge
 */

import { CONTENT_STATUS } from '../../domain/trust/trustTypes';
import { getContentStatusLabel, getContentStatusColor } from '../../domain/trust/trustUtils';

export default function ModerationBadge({ status, size = 'small' }) {
  if (!status || status === CONTENT_STATUS.ACTIVE || status === CONTENT_STATUS.RESTORED) {
    return null;
  }

  const label = getContentStatusLabel(status);
  const color = getContentStatusColor(status);

  return (
    <span
      className={`moderation-badge moderation-badge--${size}`}
      style={{ color, borderColor: color }}
      aria-label={`Content status: ${label}`}
    >
      {label}
    </span>
  );
}
