import { useState } from 'react';
import { FaHeart, FaRegHeart, FaRetweet, FaRegComment, FaShare, FaBookmark, FaRegBookmark, FaExchangeAlt } from 'react-icons/fa';
import ShareSheet from '../distribution/ShareSheet';

export default function PostActions({ post, actions, currentUserId }) {
  const {
    handleLike,
    handleUnlike,
    handleRepost,
    handleUnrepost,
    handleSave,
    handleUnsave,
    handleShare,
  } = actions;

  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="post-actions">
      <button
        className={`post-action-btn ${post.isLiked ? 'active liked' : ''}`}
        onClick={() => post.isLiked ? handleUnlike(post) : handleLike(post)}
        aria-label={post.isLiked ? 'Unlike' : 'Like'}
      >
        {post.isLiked ? <FaHeart /> : <FaRegHeart />}
        <span className="post-action-count">{post.likeCount || ''}</span>
      </button>

      <button
        className="post-action-btn"
        aria-label="Comment"
      >
        <FaRegComment />
        <span className="post-action-count">{post.commentCount || ''}</span>
      </button>

      <button
        className={`post-action-btn ${post.isReposted ? 'active reposted' : ''}`}
        onClick={() => post.isReposted ? handleUnrepost(post) : handleRepost(post)}
        aria-label={post.isReposted ? 'Undo repost' : 'Repost'}
      >
        <FaRetweet />
        <span className="post-action-count">{post.repostCount || ''}</span>
      </button>

      <button
        className="post-action-btn"
        onClick={() => setShareOpen(true)}
        aria-label="Share"
      >
        <FaShare />
      </button>

      <button
        className={`post-action-btn ${post.isSaved ? 'active saved' : ''}`}
        onClick={() => post.isSaved ? handleUnsave(post) : handleSave(post)}
        aria-label={post.isSaved ? 'Unsave' : 'Save'}
      >
        {post.isSaved ? <FaBookmark /> : <FaRegBookmark />}
      </button>

      <ShareSheet item={post} isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
