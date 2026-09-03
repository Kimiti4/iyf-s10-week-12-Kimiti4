import { FiInbox } from 'react-icons/fi';

export default function EmptyState({ icon, title, description, action, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon || <FiInbox size={48} />}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {(action || onAction) && (
        <button
          className="btn btn-primary"
          onClick={onAction || action}
          aria-label={actionLabel || title}
        >
          {actionLabel || 'Get Started'}
        </button>
      )}
    </div>
  );
}
