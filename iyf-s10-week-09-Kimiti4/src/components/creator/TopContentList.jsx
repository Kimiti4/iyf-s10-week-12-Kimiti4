import { Link } from 'react-router-dom';
import { FaHeart, FaComment, FaEye } from 'react-icons/fa';

export default function TopContentList({ items = [] }) {
  if (items.length === 0) {
    return (
      <div className="top-content-empty">
        <p>No content yet. Start creating to see your top performers!</p>
      </div>
    );
  }

  return (
    <div className="top-content-list">
      {items.map((item, index) => (
        <Link
          key={item.id || index}
          to={item.type === 'reel' ? `/reels/${item.id}` : `/posts/${item.id}`}
          className="top-content-item"
        >
          <span className="top-content-rank">#{index + 1}</span>
          <div className="top-content-info">
            <p className="top-content-title">
              {item.title || item.content?.substring(0, 60) || 'Untitled'}
            </p>
            <div className="top-content-stats">
              <span><FaHeart /> {item.likes || item.likeCount || 0}</span>
              <span><FaComment /> {item.comments || item.commentCount || 0}</span>
              <span><FaEye /> {item.views || item.viewCount || 0}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
