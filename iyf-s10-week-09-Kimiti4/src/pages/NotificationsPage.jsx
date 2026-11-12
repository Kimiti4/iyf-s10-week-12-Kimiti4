import { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationItem from '../components/notifications/NotificationItem';
import NotificationGroup from '../components/notifications/NotificationGroup';
import NotificationSkeleton from '../components/notifications/NotificationSkeleton';
import NotificationEmptyState from '../components/notifications/NotificationEmptyState';
import PageHeader from '../components/primitives/PageHeader';
import ErrorState from '../components/primitives/ErrorState';
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
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up'}
        actions={
          unreadCount > 0 ? (
            <button type="button" className="btn btn-secondary" onClick={markAllRead}>
              Mark all read
            </button>
          ) : null
        }
      />

      <div className="notifications-content">
        {status === 'loading' && grouped.length === 0 && <NotificationSkeleton />}

        {status === 'error' && (
          <ErrorState error={error} onRetry={() => fetchNotifications()} />
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
          <button type="button" className="btn btn-ghost notifications-load-more" onClick={loadMore}>
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
