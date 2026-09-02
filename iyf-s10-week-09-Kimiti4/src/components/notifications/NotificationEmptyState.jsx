import { FaBell } from 'react-icons/fa';
import EmptyState from '../primitives/EmptyState';

export default function NotificationEmptyState() {
  return (
    <EmptyState
      icon={<FaBell />}
      title="No notifications yet"
      hint="When someone interacts with your content, you'll see it here"
      className="notification-empty"
    />
  );
}
