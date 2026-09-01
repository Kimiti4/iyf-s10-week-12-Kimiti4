import { Link } from 'react-router-dom';
import AvatarIcon from '../AvatarIcon';
import { formatRelativeTime } from '../../utils/formatTime';

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
          {formatRelativeTime(group.latestCreatedAt)}
        </span>
      </div>

      {isUnread && <span className="notification-item-dot" aria-label="Unread" />}
    </Link>
  );
}
