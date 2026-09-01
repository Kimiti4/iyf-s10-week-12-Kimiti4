import { FaRetweet } from 'react-icons/fa';
import { formatRepostCount } from '../../domain/distribution/distributionUtils';

export default function RepostButton({ item, isReposted, repostCount, onRepost, onUndoRepost, disabled }) {
  const handleClick = () => {
    if (isReposted) {
      onUndoRepost?.(item);
    } else {
      onRepost?.(item);
    }
  };

  const countText = formatRepostCount(repostCount);

  return (
    <button
      className={`post-action-btn distribution-btn repost-btn ${isReposted ? 'active reposted' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={isReposted ? 'Undo repost' : 'Repost'}
      aria-pressed={isReposted}
    >
      <FaRetweet />
      {countText && <span className="post-action-count">{countText}</span>}
    </button>
  );
}
