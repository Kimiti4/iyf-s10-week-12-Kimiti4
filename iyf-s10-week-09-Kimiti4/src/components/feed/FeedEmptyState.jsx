export default function FeedEmptyState({ message, hint }) {
  return (
    <div className="feed-empty" role="status">
      <p className="feed-empty-message">{message || 'Nothing here yet'}</p>
      {hint && <p className="feed-empty-hint">{hint}</p>}
    </div>
  );
}
