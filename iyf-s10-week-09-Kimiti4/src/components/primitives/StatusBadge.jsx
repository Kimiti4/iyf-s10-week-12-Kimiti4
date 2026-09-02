/**
 * StatusBadge — Canonical status badge primitive.
 *
 * Renders a colored inline label for status indicators.
 * Replaces JamStatusBadge and ModerationBadge.
 *
 * @module components/primitives/StatusBadge
 */

import './StatusBadge.css';

export default function StatusBadge({
  label,
  color = '#6b7280',
  bg,
  dot = false,
  variant = 'filled',
  size = 'small',
  className = '',
  ...props
}) {
  if (!label) return null;

  const style =
    variant === 'filled'
      ? { color, background: bg || `${color}18` }
      : { color, borderColor: color };

  return (
    <span
      className={`status-badge status-badge--${size} status-badge--${variant} ${className}`}
      style={style}
      {...props}
    >
      {dot && <span className="status-badge-dot" style={{ background: color }} />}
      {label}
    </span>
  );
}
