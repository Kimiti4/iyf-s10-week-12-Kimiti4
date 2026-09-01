import { FaExchangeAlt } from 'react-icons/fa';
import { canRemix } from '../../domain/distribution/distributionRules';

export default function RemixButton({ item, currentUserId, remixCount, onRemix, disabled }) {
  const check = canRemix(item, currentUserId);
  const isDisabled = disabled || !check.allowed;

  return (
    <button
      className={`post-action-btn distribution-btn remix-btn`}
      onClick={() => !isDisabled && onRemix?.(item)}
      disabled={isDisabled}
      aria-label={check.allowed ? 'Remix this content' : check.reason}
      title={check.allowed ? 'Remix' : check.reason}
    >
      <FaExchangeAlt />
      {remixCount > 0 && <span className="post-action-count">{remixCount}</span>}
    </button>
  );
}
