export default function FeedErrorState({ error, onRetry }) {
  return (
    <div className="feed-error" role="alert">
      <p className="feed-error-message">{error || 'Something went wrong'}</p>
      {onRetry && (
        <button className="feed-error-retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
