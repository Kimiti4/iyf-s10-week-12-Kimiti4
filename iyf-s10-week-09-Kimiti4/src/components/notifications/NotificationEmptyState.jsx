import { FaBell } from 'react-icons/fa';

export default function NotificationEmptyState() {
  return (
    <div className="notification-empty">
      <FaBell className="notification-empty-icon" aria-hidden="true" />
      <p className="notification-empty-title">No notifications yet</p>
      <p className="notification-empty-hint">
        When someone interacts with your content, you'll see it here
      </p>
    </div>
  );
}
