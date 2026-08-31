import { Link } from 'react-router-dom';
import AvatarIcon from '../AvatarIcon';

export default function NotificationGroup({ group, onMarkRead }) {
  const isUnread = group.status === 'unread';
  const primaryActor = group.latestActor;

  const handleClick = () => {
    if (isUnread && onMarkRead) {
      onMarkRead(group.id);
    }
  };

  return (
    <Link
      to={group.deepLink}
      className={`notification-item notification-group ${isUnread ? 'unread' : ''}`}
      onClick={handleClick}
    >
      <div className="notification-item-avatar">
        <AvatarIcon
          user={{ _id: primaryActor.id, username: primaryActor.username, profile: { avatar: primaryActor.avatar } }}
          size="small"
        />
        {group.isGrouped && (
          <span className="notification-group-count" aria-label={`${group.count} notifications`}>
            {group.count}
          </span>
        )}
      </div>

      <div className="notification-item-body">
        <p className="notification-item-message">{group.message}</p>
        <span className="notification-item-time">
          {formatTime(group.latestCreatedAt)}
        </span>
      </div>

      {isUnread && <span className="notification-item-dot" aria-label="Unread" />}
    </Link>
  );
}

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
}
