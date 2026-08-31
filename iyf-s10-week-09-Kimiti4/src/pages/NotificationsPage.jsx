import { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from '../components/notifications/NotificationItem';
import NotificationGroup from '../components/notifications/NotificationGroup';
import NotificationSkeleton from '../components/notifications/NotificationSkeleton';
import NotificationEmptyState from '../components/notifications/NotificationEmptyState';
import './NotificationsPage.css';

export default function NotificationsPage() {
  const {
    grouped,
    unreadCount,
    status,
    error,
    hasMore,
    fetchNotifications,
    loadMore,
    markRead,
    markAllRead,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="notifications-page">
      <header className="notifications-header">
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <button className="notifications-mark-all" onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </header>

      <div className="notifications-content">
        {status === 'loading' && grouped.length === 0 && <NotificationSkeleton />}

        {status === 'error' && (
          <div className="notifications-error" role="alert">
            {error}
            <button onClick={() => fetchNotifications()}>Try again</button>
          </div>
        )}

        {status === 'loaded' && grouped.length === 0 && <NotificationEmptyState />}

        <div className="notifications-list">
          {grouped.map((item) =>
            item.isGrouped ? (
              <NotificationGroup key={item.id} group={item} onMarkRead={markRead} />
            ) : (
              <NotificationItem key={item.id} notification={item} onMarkRead={markRead} />
            )
          )}
        </div>

        {hasMore && status !== 'loading' && (
          <button className="notifications-load-more" onClick={loadMore}>
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
