import { Link } from 'react-router-dom';
import AvatarIcon from '../AvatarIcon';
import { NOTIFICATION_TYPE } from '../../domain/notifications/notificationTypes';
import { formatRelativeTime } from '../../utils/formatTime';

const TYPE_ICONS = {
  [NOTIFICATION_TYPE.LIKE]: '❤️',
  [NOTIFICATION_TYPE.COMMENT]: '💬',
  [NOTIFICATION_TYPE.REPLY]: '↩️',
  [NOTIFICATION_TYPE.FOLLOW]: '👤',
  [NOTIFICATION_TYPE.MENTION]: '@',
  [NOTIFICATION_TYPE.JAM_INVITE]: '🔥',
  [NOTIFICATION_TYPE.JAM_JOIN]: '🔥',
  [NOTIFICATION_TYPE.JAM_CONTRIBUTION]: '🔥',
  [NOTIFICATION_TYPE.JAM_CONTRIBUTION_REACTION]: '🔥',
  [NOTIFICATION_TYPE.JAM_COMPLETED]: '🔥',
  [NOTIFICATION_TYPE.REPOST]: '🔄',
  [NOTIFICATION_TYPE.SAVE]: '🔖',
  [NOTIFICATION_TYPE.SYSTEM]: 'ℹ️',
};

export default function NotificationItem({ notification, onMarkRead }) {
  const icon = TYPE_ICONS[notification.type] || '•';
  const isUnread = notification.status === 'unread';

  const handleClick = () => {
    if (isUnread && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  return (
    <Link
      to={notification.deepLink}
      className={`notification-item ${isUnread ? 'unread' : ''}`}
      onClick={handleClick}
    >
      <div className="notification-item-avatar">
        <AvatarIcon
          user={{ _id: notification.actor.id, username: notification.actor.username, profile: { avatar: notification.actor.avatar } }}
          size="small"
        />
        <span className="notification-item-icon" aria-hidden="true">{icon}</span>
      </div>

      <div className="notification-item-body">
        <p className="notification-item-message">{notification.message}</p>
        <span className="notification-item-time">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>

      {isUnread && <span className="notification-item-dot" aria-label="Unread" />}
    </Link>
  );
}
