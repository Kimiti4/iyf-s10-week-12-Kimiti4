import EmptyState from '../primitives/EmptyState';

export default function FeedEmptyState({ message, hint }) {
  return (
    <EmptyState
      message={message || 'Nothing here yet'}
      hint={hint}
      className="feed-empty"
    />
  );
}
