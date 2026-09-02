/**
 * ActionBar — Canonical action bar primitive.
 *
 * Renders like/comment/repost/share/save buttons.
 * Replaces duplicated action patterns in PostActions and ReelActions.
 *
 * @module components/primitives/ActionBar
 */

import { useState } from 'react';
import { FaHeart, FaRegHeart, FaRegComment, FaShare, FaRetweet, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import ShareSheet from '../distribution/ShareSheet';
import './ActionBar.css';

export default function ActionBar({
  isLiked = false,
  likeCount,
  onLike,
  onUnlike,
  isReposted = false,
  repostCount,
  onRepost,
  onUndoRepost,
  commentCount,
  onComment,
  isSaved = false,
  onToggleSave,
  onShare,
  shareableItem,
  showReport = false,
  reportButton,
  className = '',
}) {
  const [shareOpen, setShareOpen] = useState(false);

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    } else if (shareableItem) {
      setShareOpen(true);
    }
  };

  return (
    <div className={`action-bar ${className}`}>
      <button
        className={`action-bar-btn ${isLiked ? 'active liked' : ''}`}
        onClick={() => isLiked ? onUnlike?.() : onLike?.()}
        aria-label={isLiked ? 'Unlike' : 'Like'}
      >
        {isLiked ? <FaHeart /> : <FaRegHeart />}
        {likeCount != null && <span className="action-bar-count">{likeCount}</span>}
      </button>

      <button
        className="action-bar-btn"
        onClick={onComment}
        aria-label="Comment"
      >
        <FaRegComment />
        {commentCount != null && <span className="action-bar-count">{commentCount}</span>}
      </button>

      {onRepost && (
        <button
          className={`action-bar-btn ${isReposted ? 'active reposted' : ''}`}
          onClick={() => isReposted ? onUndoRepost?.() : onRepost()}
          aria-label={isReposted ? 'Undo repost' : 'Repost'}
        >
          <FaRetweet />
          {repostCount != null && repostCount > 0 && <span className="action-bar-count">{repostCount}</span>}
        </button>
      )}

      <button
        className="action-bar-btn"
        onClick={handleShareClick}
        aria-label="Share"
      >
        <FaShare />
      </button>

      <button
        className={`action-bar-btn ${isSaved ? 'active saved' : ''}`}
        onClick={() => onToggleSave?.()}
        aria-label={isSaved ? 'Unsave' : 'Save'}
      >
        {isSaved ? <FaBookmark /> : <FaRegBookmark />}
      </button>

      {showReport && reportButton}

      {shareableItem && (
        <ShareSheet item={shareableItem} isOpen={shareOpen} onClose={() => setShareOpen(false)} />
      )}
    </div>
  );
}
