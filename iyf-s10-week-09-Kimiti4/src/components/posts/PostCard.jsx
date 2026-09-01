import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PostAuthor from './PostAuthor';
import PostMedia from './PostMedia';
import PostActions from './PostActions';
import PostEngagement from './PostEngagement';
import PostJamConnector from '../jam-signature/PostJamConnector';
import ContentStatusNotice from '../trust/ContentStatusNotice';
import ModerationBadge from '../trust/ModerationBadge';
import { formatRelativeTime } from '../../utils/formatTime';

export default function PostCard({ post, actions, showAuthor = true, contentStatus, currentUserId }) {
  const timeText = useMemo(() => formatRelativeTime(post.createdAt), [post.createdAt]);

  if (post.deletedAt || contentStatus === 'removed') {
    return (
      <article className="post-card post-card--deleted">
        <p className="post-card-deleted-notice">This post has been deleted</p>
      </article>
    );
  }

  return (
    <article className="post-card" data-post-id={post.id}>
      {contentStatus && contentStatus !== 'active' && (
        <ContentStatusNotice
          status={contentStatus}
          isOwner={currentUserId === post.author?.id}
          authorId={post.author?.id}
          currentUserId={currentUserId}
        />
      )}

      {showAuthor && (
        <div className="post-card-header">
          <PostAuthor author={post.author} />
          <div className="post-card-header-right">
            {contentStatus && contentStatus !== 'active' && (
              <ModerationBadge status={contentStatus} />
            )}
            <span className="post-card-time">{timeText}</span>
          </div>
        </div>
      )}

      <Link to={`/posts/${post.id}`} className="post-card-content">
        {post.title && <h3 className="post-card-title">{post.title}</h3>}
        {post.content && <p className="post-card-text">{post.content}</p>}
        <PostMedia src={post.image} alt={post.title || post.content} />
      </Link>

      <PostEngagement post={post} />

      {post.jam && <PostJamConnector jam={post.jam} contribution={post.jamContribution} />}

      {actions && (
        <div className="post-card-actions">
          <PostActions post={post} actions={actions} contentStatus={contentStatus} currentUserId={currentUserId} />
        </div>
      )}
    </article>
  );
}
