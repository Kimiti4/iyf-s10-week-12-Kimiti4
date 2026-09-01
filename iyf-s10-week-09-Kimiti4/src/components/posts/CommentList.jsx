import AvatarIcon from '../AvatarIcon';
import CommentComposer from './CommentComposer';
import { FaHeart, FaTrash } from 'react-icons/fa';
import { formatRelativeTime } from '../../utils/formatTime';

function CommentItem({ comment, onReply, onLike, onDelete, currentUserId }) {
  const isOwn = comment.author.id === currentUserId;

  return (
    <div className="comment-item">
      <AvatarIcon
        user={{ _id: comment.author.id, username: comment.author.username, profile: { avatar: comment.author.avatar } }}
        size="small"
      />
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">{comment.author.username}</span>
          <span className="comment-time">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className="comment-text">{comment.content}</p>
        <div className="comment-footer">
          <button
            className={`comment-action ${comment.isLiked ? 'liked' : ''}`}
            onClick={() => onLike(comment.id)}
            aria-label={comment.isLiked ? 'Unlike' : 'Like'}
          >
            <FaHeart /> {comment.likeCount || ''}
          </button>
          <button className="comment-action" onClick={() => onReply(comment.id)}>
            Reply
          </button>
          {isOwn && (
            <button className="comment-action delete" onClick={() => onDelete(comment.id)} aria-label="Delete">
              <FaTrash />
            </button>
          )}
        </div>

        {/* Replies */}
        {comment.replies?.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReply={onReply}
                onLike={onLike}
                onDelete={onDelete}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentList({ comments, status, onAddComment, onLikeComment, onDeleteComment, currentUserId }) {
  const [replyTo, setReplyTo] = useState(null);

  const handleSubmit = async (content) => {
    await onAddComment(content, replyTo);
    setReplyTo(null);
  };

  if (status === 'loading') {
    return <div className="comment-list-loading">Loading comments...</div>;
  }

  return (
    <div className="comment-list">
      <CommentComposer
        onSubmit={handleSubmit}
        placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
      />

      {replyTo && (
        <div className="comment-reply-indicator">
          Replying to comment
          <button onClick={() => setReplyTo(null)}>Cancel</button>
        </div>
      )}

      <div className="comment-items">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={setReplyTo}
            onLike={onLikeComment}
            onDelete={onDeleteComment}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      {status === 'loaded' && comments.length === 0 && (
        <p className="comment-list-empty">No comments yet. Be the first!</p>
      )}
    </div>
  );
}
