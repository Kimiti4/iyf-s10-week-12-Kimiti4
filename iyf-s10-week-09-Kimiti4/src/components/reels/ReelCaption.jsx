import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import AvatarIcon from '../AvatarIcon';
import { useFollow } from '../../hooks/useFollow';

export default function ReelCaption({ reel }) {
  const [expanded, setExpanded] = useState(false);
  const { isFollowed, toggle, loading } = useFollow(reel.author.id, reel.author.isFollowed);

  const caption = reel.caption || '';
  const isLong = caption.length > 120;
  const displayText = expanded || !isLong ? caption : caption.slice(0, 120) + '...';

  return (
    <div className="reel-caption">
      <div className="reel-caption-author">
        <AvatarIcon
          user={{ _id: reel.author.id, username: reel.author.username, profile: { avatar: reel.author.avatar } }}
          size="small"
        />
        <Link to={`/profile/${reel.author.id}`} className="reel-caption-username">
          {reel.author.username}
          {reel.author.isVerified && <FaCheckCircle className="reel-caption-badge" aria-label="Verified" />}
        </Link>
        <button
          className={`reel-caption-follow ${isFollowed ? 'following' : ''}`}
          onClick={toggle}
          disabled={loading}
        >
          {isFollowed ? 'Following' : 'Follow'}
        </button>
      </div>

      {caption && (
        <p className="reel-caption-text">
          {displayText}
          {isLong && (
            <button className="reel-caption-more" onClick={() => setExpanded(!expanded)}>
              {expanded ? ' less' : ' more'}
            </button>
          )}
        </p>
      )}

      {reel.jamId && reel.jamTitle && (
        <Link to={`/jams/${reel.jamId}`} className="reel-caption-jam-cta">
          🔥 {reel.jamCTA || `Join: ${reel.jamTitle}`}
        </Link>
      )}
    </div>
  );
}
