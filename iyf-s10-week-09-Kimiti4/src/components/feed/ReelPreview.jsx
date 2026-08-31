import { Link } from 'react-router-dom';
import { FaPlay, FaHeart, FaComment } from 'react-icons/fa';

export default function ReelPreview({ reel }) {
  return (
    <article className="reel-preview" data-reel-id={reel.id}>
      <Link to={`/reels/${reel.id}`} className="reel-preview-link">
        <div className="reel-preview-video">
          {reel.posterUrl ? (
            <img src={reel.posterUrl} alt="" className="reel-preview-poster" loading="lazy" />
          ) : (
            <div className="reel-preview-placeholder">
              <span>🎬</span>
            </div>
          )}
          <div className="reel-preview-play">
            <FaPlay aria-hidden="true" />
          </div>
        </div>

        <div className="reel-preview-info">
          <p className="reel-preview-caption">
            {reel.caption?.slice(0, 120) || 'Reel'}
          </p>
          <div className="reel-preview-stats">
            {reel.likeCount > 0 && (
              <span><FaHeart aria-hidden="true" /> {reel.likeCount}</span>
            )}
            {reel.commentCount > 0 && (
              <span><FaComment aria-hidden="true" /> {reel.commentCount}</span>
            )}
          </div>
          <span className="reel-preview-author">
            @{reel.author?.username || 'creator'}
          </span>
        </div>

        {reel.jamId && (
          <span className="reel-preview-jam-badge">🔥 Jam</span>
        )}
      </Link>
    </article>
  );
}
