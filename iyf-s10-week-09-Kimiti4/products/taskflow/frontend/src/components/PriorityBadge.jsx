export function PriorityBadge({ priority }) {
  const colors = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
    urgent: 'priority-urgent',
  };

  return (
    <span className={`priority-badge ${colors[priority] || 'priority-low'}`}>
      {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Low'}
    </span>
  );
}
