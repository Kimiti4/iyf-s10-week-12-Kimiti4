export function LabelBadge({ label, onRemove }) {
  return (
    <span
      className="label-badge"
      style={{ backgroundColor: label.color || '#6366f1', color: '#fff' }}
    >
      {label.name}
      {onRemove && (
        <button
          className="label-badge-remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(label.id || label._id);
          }}
          aria-label={`Remove label ${label.name}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
