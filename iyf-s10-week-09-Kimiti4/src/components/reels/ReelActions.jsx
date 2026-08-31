import { FaHeart, FaRegHeart, FaRegComment, FaShare, FaBookmark, FaRegBookmark } from 'react-icons/fa';

export default function ReelActions({ reel, onLike, onUnlike, onSave, onUnsave, onShare }) {
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
