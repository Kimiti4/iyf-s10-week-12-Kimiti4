export function StatusBadge({ status }) {
  const colors = {
    todo: 'badge-gray',
    in_progress: 'badge-blue',
    review: 'badge-yellow',
    done: 'badge-green',
    active: 'badge-green',
    archived: 'badge-gray',
  };

  const labels = {
    todo: 'Todo',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done',
    active: 'Active',
    archived: 'Archived',
  };

  return (
    <span className={`status-badge ${colors[status] || 'badge-gray'}`}>
      {labels[status] || status}
    </span>
  );
}
