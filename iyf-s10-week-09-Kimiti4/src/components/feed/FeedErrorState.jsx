import ErrorState from '../primitives/ErrorState';

export default function FeedErrorState({ error, onRetry }) {
  return (
    <ErrorState
      error={error}
      onRetry={onRetry}
      className="feed-error"
    />
  );
}
