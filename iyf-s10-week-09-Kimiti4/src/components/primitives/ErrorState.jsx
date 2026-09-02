/**
 * ErrorState — Canonical error state primitive.
 *
 * @module components/primitives/ErrorState
 */

export default function ErrorState({
  error,
  message,
  onRetry,
  className = '',
  ...props
}) {
  return (
    <div className={`error-state ${className}`} role="alert" {...props}>
      <p className="error-state-message">{error || message || 'Something went wrong'}</p>
      {onRetry && (
        <button className="error-state-retry" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
