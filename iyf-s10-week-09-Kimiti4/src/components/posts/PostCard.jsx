import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PostAuthor from './PostAuthor';
import PostMedia from './PostMedia';
import PostActions from './PostActions';
import PostEngagement from './PostEngagement';

function formatTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const seconds = Math.floor(diffMs / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
}

export default function PostCard({ post, actions, showAuthor = true }) {
  const timeText = useMemo(() => formatTime(post.createdAt), [post.createdAt]);

  if (post.deletedAt) {
    return (
      <article className="post-card post-card--deleted">
        <p className="post-card-deleted-notice">This post has been deleted</p>
      </article>
    );
  }

  return (
    <article className="post-card" data-post-id={post.id}>
      {showAuthor && (
        <div className="post-card-header">
          <PostAuthor author={post.author} />
          <span className="post-card-time">{timeText}</span>
        </div>
      )}

      <Link to={`/posts/${post.id}`} className="post-card-content">
        {post.title && <h3 className="post-card-title">{post.title}</h3>}
        {post.content && <p className="post-card-text">{post.content}</p>}
        <PostMedia src={post.image} alt={post.title || post.content} />
      </Link>

      <PostEngagement post={post} />

      {actions && (
        <div className="post-card-actions">
          <PostActions post={post} actions={actions} />
        </div>
      )}
    </article>
  );
}
