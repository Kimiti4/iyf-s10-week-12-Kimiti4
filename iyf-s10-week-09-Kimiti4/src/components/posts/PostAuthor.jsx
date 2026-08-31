import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import AvatarIcon from '../AvatarIcon';
import { useFollow } from '../../hooks/useFollow';

export default function PostAuthor({ author, showFollow = true, size = 'normal' }) {
  const { isFollowed, toggle, loading } = useFollow(author.id, author.isFollowed);

  return (
    <div className={`post-author post-author--${size}`}>
      <AvatarIcon
        user={{ _id: author.id, username: author.username, profile: { avatar: author.avatar } }}
        size={size === 'small' ? 'small' : 'medium'}
      />
      <div className="post-author-info">
        <Link to={`/profile/${author.id}`} className="post-author-name">
          {author.username}
          {author.isVerified && (
            <FaCheckCircle className="post-author-badge" aria-label="Verified" />
          )}
        </Link>
      </div>
      {showFollow && (
        <button
          className={`post-follow-btn ${isFollowed ? 'following' : ''}`}
          onClick={(e) => { e.preventDefault(); toggle(); }}
          disabled={loading}
          aria-label={isFollowed ? 'Unfollow' : 'Follow'}
        >
          {isFollowed ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
}
