import { FaHeart, FaRegHeart, FaRetweet, FaRegComment, FaShare, FaBookmark, FaRegBookmark } from 'react-icons/fa';

export default function PostActions({ post, actions }) {
  const {
    handleLike,
    handleUnlike,
    handleRepost,
    handleUnrepost,
    handleSave,
    handleUnsave,
    handleShare,
  } = actions;

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
        onClick={() => handleShare(post)}
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
    </div>
  );
}
