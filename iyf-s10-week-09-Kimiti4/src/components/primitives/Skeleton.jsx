/**
 * Skeleton — Canonical loading skeleton primitive.
 *
 * @module components/primitives/Skeleton
 */

export default function Skeleton({
  count = 3,
  variant = 'card',
  className = '',
  ...props
}) {
  return (
    <div className={`skeleton skeleton--${variant} ${className}`} aria-hidden="true" {...props}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`skeleton-item skeleton-item--${variant}`}>
          <div className="skeleton-avatar" />
          <div className="skeleton-content">
            <div className="skeleton-line skeleton-line--title" />
            <div className="skeleton-line skeleton-line--body" />
            {variant === 'card' && <div className="skeleton-line skeleton-line--footer" />}
          </div>
        </div>
      ))}
    </div>
  );
}
