import { useEffect } from 'react';
import PostCard from '../components/posts/PostCard';
import { usePosts } from '../hooks/usePosts';
import { usePostActions } from '../hooks/usePostActions';
import PageHeader from '../components/primitives/PageHeader';
import EmptyState from '../components/primitives/EmptyState';
import ErrorState from '../components/primitives/ErrorState';
import '../components/posts/posts.css';
import './FollowingPage.css';

const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

export default function FollowingPage() {
  const { posts, status, error, hasMore, fetchPosts, loadMore, updatePost } = usePosts();
  const actions = usePostActions(updatePost);

  useEffect(() => {
    fetchPosts({ sort: 'recent' });
  }, [fetchPosts]);

  return (
    <div className="following-page">
      <PageHeader
        eyebrow="Network"
        title="Following"
        subtitle="Posts from people you follow"
      />

      <div className="following-page-content">
        {status === LOADING && posts.length === 0 && (
          <div className="following-page-loading" role="status">
            <div className="following-page-spinner" aria-hidden="true" />
          </div>
        )}

        {status === ERROR && (
          <ErrorState error={error} onRetry={() => fetchPosts({ sort: 'recent' })} />
        )}

        {status === LOADED && posts.length === 0 && (
          <EmptyState
            icon="🤝"
            title="No posts from people you follow"
            message="Follow creators to see their posts here"
          />
        )}

        <div className="following-page-posts">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} actions={actions} />
          ))}
        </div>

        {hasMore && status !== LOADING && (
          <button type="button" className="btn btn-ghost following-page-load-more" onClick={loadMore}>
            Load more
          </button>
        )}

        {status === LOADING && posts.length > 0 && (
          <div className="following-page-loading-more" role="status">
            <div className="following-page-spinner" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}
