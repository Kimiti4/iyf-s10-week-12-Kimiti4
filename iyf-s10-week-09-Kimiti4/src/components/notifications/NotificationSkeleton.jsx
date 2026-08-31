export default function NotificationSkeleton() {
  return (
    <div className="notification-skeleton">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="notification-skeleton-item">
          <div className="notification-skeleton-avatar" />
          <div className="notification-skeleton-body">
            <div className="notification-skeleton-line" />
            <div className="notification-skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}
