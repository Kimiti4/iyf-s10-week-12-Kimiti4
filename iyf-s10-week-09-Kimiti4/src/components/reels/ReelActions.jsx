import { FaHeart, FaRegHeart, FaRegComment, FaShare, FaRetweet, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import ShareSheet from '../distribution/ShareSheet';

export default function ReelActions({ reel, onLike, onUnlike, onSave, onUnsave, onShare, onRepost, onUndoRepost }) {
  return (
    <div className="reel-actions">
      <button
        className={`reel-action-btn ${reel.isLiked ? 'active liked' : ''}`}
        onClick={() => reel.isLiked ? onUnlike() : onLike()}
        aria-label={reel.isLiked ? 'Unlike' : 'Like'}
      >
        {reel.isLiked ? <FaHeart /> : <FaRegHeart />}
        <span>{reel.likeCount || ''}</span>
      </button>

      <button className="reel-action-btn" aria-label="Comment">
        <FaRegComment />
        <span>{reel.commentCount || ''}</span>
      </button>

      {onRepost && (
        <button
          className={`reel-action-btn ${reel.isReposted ? 'active reposted' : ''}`}
          onClick={() => reel.isReposted ? onUndoRepost?.() : onRepost()}
          aria-label={reel.isReposted ? 'Undo repost' : 'Repost'}
        >
          <FaRetweet />
          {reel.repostCount > 0 && <span>{reel.repostCount}</span>}
        </button>
      )}

      <button
        className="reel-action-btn"
        onClick={onShare}
        aria-label="Share"
      >
        <FaShare />
      </button>

      <button
        className={`reel-action-btn ${reel.isSaved ? 'active saved' : ''}`}
        onClick={() => reel.isSaved ? onUnsave() : onSave()}
        aria-label={reel.isSaved ? 'Unsave' : 'Save'}
      >
        {reel.isSaved ? <FaBookmark /> : <FaRegBookmark />}
      </button>
    </div>
  );
}
