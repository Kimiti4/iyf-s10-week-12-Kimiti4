import { JAM_STATUS } from '../../models/jam';

const STATUS_CONFIG = {
  [JAM_STATUS.DRAFT]: {
    label: 'Draft',
    color: '#6b7280',
    bg: 'rgba(107, 114, 128, 0.12)',
  },
  [JAM_STATUS.SCHEDULED]: {
    label: 'Scheduled',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.12)',
  },
  [JAM_STATUS.ACTIVE]: {
    label: 'Live',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
  },
  [JAM_STATUS.ENDED]: {
    label: 'Ended',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
  },
  [JAM_STATUS.ARCHIVED]: {
    label: 'Archived',
    color: '#6b7280',
    bg: 'rgba(107, 114, 128, 0.08)',
  },
};

export default function JamStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[JAM_STATUS.DRAFT];

  return (
    <span
      className="jam-status-badge"
      style={{ color: config.color, background: config.bg }}
    >
      {status === JAM_STATUS.ACTIVE && (
        <span className="jam-status-dot" style={{ background: config.color }} />
      )}
      {config.label}
    </span>
  );
}
