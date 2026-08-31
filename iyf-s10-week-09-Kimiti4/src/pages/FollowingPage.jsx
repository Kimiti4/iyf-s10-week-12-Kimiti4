import { useState, useEffect, useCallback } from 'react';
import PostCard from '../components/posts/PostCard';
import { usePosts } from '../hooks/usePosts';
import { usePostActions } from '../hooks/usePostActions';
import { postsAPI } from '../services/postApi';
import '../components/posts/posts.css';
import './FollowingPage.css';

const IDLE = 'idle';
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
      <header className="following-page-header">
        <h1>Following</h1>
      </header>

      <div className="following-page-content">
        {status === LOADING && posts.length === 0 && (
          <div className="following-page-loading">
            <div className="following-page-spinner" />
          </div>
        )}

        {status === ERROR && (
          <div className="following-page-error" role="alert">
            {error}
            <button onClick={() => fetchPosts({ sort: 'recent' })}>Try again</button>
          </div>
        )}

        {status === LOADED && posts.length === 0 && (
          <div className="following-page-empty">
            <p>No posts from people you follow yet</p>
            <p className="following-page-empty-hint">
              Follow creators to see their posts here
            </p>
          </div>
        )}

        <div className="following-page-posts">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} actions={actions} />
          ))}
        </div>

        {hasMore && status !== LOADING && (
          <button className="following-page-load-more" onClick={loadMore}>
            Load more
          </button>
        )}

        {status === LOADING && posts.length > 0 && (
          <div className="following-page-loading-more">
            <div className="following-page-spinner" />
          </div>
        )}
      </div>
    </div>
  );
}
