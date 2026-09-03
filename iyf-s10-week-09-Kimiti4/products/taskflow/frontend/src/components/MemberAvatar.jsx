export default function MemberAvatar({ user, size = 'sm', showName = true }) {
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??';

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f59e0b', '#22c55e', '#06b6d4', '#3b82f6',
  ];
  const colorIndex = (user?.name || '').charCodeAt(0) % colors.length;

  return (
    <div className={`member-avatar member-avatar-${size}`}>
      <div
        className="avatar-circle"
        style={{ backgroundColor: colors[colorIndex] }}
        title={user?.name || 'Unknown'}
      >
        {initials}
      </div>
      {showName && <span className="avatar-name">{user?.name || 'Unknown'}</span>}
    </div>
  );
}
