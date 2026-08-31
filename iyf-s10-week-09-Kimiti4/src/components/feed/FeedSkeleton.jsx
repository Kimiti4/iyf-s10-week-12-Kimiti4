export default function FeedSkeleton() {
  return (
    <div className="feed-skeleton">
      {[1, 2, 3].map((i) => (
        <div key={i} className="feed-skeleton-card">
          <div className="feed-skeleton-header">
            <div className="feed-skeleton-avatar" />
            <div className="feed-skeleton-lines">
              <div className="feed-skeleton-line short" />
              <div className="feed-skeleton-line tiny" />
            </div>
          </div>
          <div className="feed-skeleton-body">
            <div className="feed-skeleton-line" />
            <div className="feed-skeleton-line" />
            <div className="feed-skeleton-line medium" />
          </div>
          <div className="feed-skeleton-footer">
            <div className="feed-skeleton-action" />
            <div className="feed-skeleton-action" />
            <div className="feed-skeleton-action" />
          </div>
        </div>
      ))}
    </div>
  );
}
