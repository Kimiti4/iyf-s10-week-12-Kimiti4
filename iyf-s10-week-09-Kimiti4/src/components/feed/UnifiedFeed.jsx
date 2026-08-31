import { useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUnifiedFeed } from '../../hooks/useUnifiedFeed';
import { usePosts } from '../../hooks/usePosts';
import { usePostActions } from '../../hooks/usePostActions';
import FeedTabs from './FeedTabs';
import FeedItem from './FeedItem';
import FeedSkeleton from './FeedSkeleton';
import FeedEmptyState from './FeedEmptyState';
import FeedErrorState from './FeedErrorState';
import { FEED_TAB } from '../../domain/feed/feedTypes';

export default function UnifiedFeed() {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const followedIds = user?.following || [];

  const {
    items,
    status,
    error,
    hasMore,
    activeTab,
    fetchFeed,
    loadMore,
    switchTab,
  } = useUnifiedFeed(userId, followedIds);

  const { updatePost } = usePosts();
  const postActions = usePostActions(updatePost);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleRetry = useCallback(() => {
    fetchFeed();
  }, [fetchFeed]);

  const emptyMessages = {
    [FEED_TAB.FOR_YOU]: { message: 'No posts yet', hint: 'Follow creators or check back later' },
    [FEED_TAB.FOLLOWING]: { message: 'No posts from people you follow', hint: 'Follow creators to see their posts here' },
    [FEED_TAB.JAMS]: { message: 'No active Jams', hint: 'Start a Jam to get things going' },
  };

  return (
    <div className="unified-feed">
      <FeedTabs activeTab={activeTab} onTabChange={switchTab} />

      {status === 'loading' && items.length === 0 && <FeedSkeleton />}

      {status === 'error' && <FeedErrorState error={error} onRetry={handleRetry} />}

      {status === 'loaded' && items.length === 0 && (
        <FeedEmptyState
          message={emptyMessages[activeTab]?.message}
          hint={emptyMessages[activeTab]?.hint}
        />
      )}

      <div className="unified-feed-list">
        {items.map((item) => (
          <FeedItem key={item.id} item={item} postActions={postActions} />
        ))}
      </div>

      {hasMore && status !== 'loading' && (
        <button className="unified-feed-load-more" onClick={loadMore}>
          Load more
        </button>
      )}

      {status === 'loading' && items.length > 0 && (
        <div className="unified-feed-loading-more">
          <div className="unified-feed-spinner" />
        </div>
      )}
    </div>
  );
}
