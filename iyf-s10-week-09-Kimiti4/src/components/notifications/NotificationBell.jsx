import { Link } from 'react-router-dom';
import AvatarIcon from '../AvatarIcon';
import { FaBell } from 'react-icons/fa';

export default function NotificationBell({ unreadCount, onClick }) {
  return (
    <button
      className="notification-bell"
      onClick={onClick}
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
    >
      <FaBell />
      {unreadCount > 0 && (
        <span className="notification-bell-badge" aria-hidden="true">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
