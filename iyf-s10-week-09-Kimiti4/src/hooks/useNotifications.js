import { useState, useCallback, useEffect, useRef } from 'react';
import { notificationsAPI } from '../services/notificationApi';
import { groupNotifications } from '../domain/notifications/notificationGrouping';

const IDLE = 'idle';
const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

const POLL_INTERVAL = 30000; // 30 seconds

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [grouped, setGrouped] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const pollRef = useRef(null);

  const fetchNotifications = useCallback(async (reset = true) => {
    if (reset) setStatus(LOADING);
    setError('');

    try {
      const data = await notificationsAPI.getAll(reset ? {} : { page: Math.ceil(notifications.length / 20) + 1 });
      if (reset) {
        setNotifications(data.notifications);
        setGrouped(groupNotifications(data.notifications));
      } else {
        setNotifications((prev) => {
          const merged = [...prev, ...data.notifications];
          setGrouped(groupNotifications(merged));
          return merged;
        });
      }
      setUnreadCount(data.unreadCount);
      setHasMore(data.hasMore);
      setStatus(LOADED);
    } catch (err) {
      setError(err.message);
      setStatus(ERROR);
    }
  }, [notifications.length]);

  const loadMore = useCallback(async () => {
    if (status === LOADING || !hasMore) return;
    await fetchNotifications(false);
  }, [status, hasMore, fetchNotifications]);

  const markRead = useCallback(async (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, status: 'read' } : n))
    );
    setGrouped((prev) =>
      prev.map((g) => (g.id === notificationId ? { ...g, status: 'read' } : g))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await notificationsAPI.markRead(notificationId);
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'read' })));
    setGrouped((prev) => prev.map((g) => ({ ...g, status: 'read' })));
    setUnreadCount(0);
    await notificationsAPI.markAllRead();
  }, []);

  // Poll for new notifications
  useEffect(() => {
    pollRef.current = setInterval(() => {
      notificationsAPI.getUnreadCount().then((count) => {
        setUnreadCount(count);
      }).catch(() => {});
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return {
    notifications,
    grouped,
    unreadCount,
    status,
    error,
    hasMore,
    fetchNotifications,
    loadMore,
    markRead,
    markAllRead,
  };
}
