/**
 * ModerationBadge
 *
 * Small inline badge showing content moderation status.
 * Uses canonical StatusBadge primitive.
 *
 * @module components/trust/ModerationBadge
 */

import { CONTENT_STATUS } from '../../domain/trust/trustTypes';
import { getContentStatusLabel, getContentStatusColor } from '../../domain/trust/trustUtils';
import StatusBadge from '../primitives/StatusBadge';

export default function ModerationBadge({ status, size = 'small' }) {
  if (!status || status === CONTENT_STATUS.ACTIVE || status === CONTENT_STATUS.RESTORED) {
    return null;
  }

  const label = getContentStatusLabel(status);
  const color = getContentStatusColor(status);

  return (
    <StatusBadge
      label={label}
      color={color}
      variant="outlined"
      size={size}
      className="moderation-badge"
      aria-label={`Content status: ${label}`}
    />
  );
}
