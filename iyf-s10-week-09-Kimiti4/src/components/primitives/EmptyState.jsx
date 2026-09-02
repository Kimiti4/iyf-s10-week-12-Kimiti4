/**
 * EmptyState — Canonical empty state primitive.
 *
 * @module components/primitives/EmptyState
 */

import './StatePrimitives.css';

export default function EmptyState({
  icon,
  title,
  message,
  hint,
  action,
  className = '',
  ...props
}) {
  return (
    <div className={`empty-state ${className}`} role="status" {...props}>
      {icon && <div className="empty-state-icon" aria-hidden="true">{icon}</div>}
      {title && <p className="empty-state-title">{title}</p>}
      {(message || hint) && (
        <p className="empty-state-hint">{hint || message}</p>
      )}
      {action && (
        <button className="empty-state-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
