import { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUnifiedFeed } from '../../hooks/useUnifiedFeed';
import { usePosts } from '../../hooks/usePosts';
import { usePostActions } from '../../hooks/usePostActions';
import FeedTabs from './FeedTabs';
import FeedItem from './FeedItem';
import FeedSkeleton from './FeedSkeleton';
import FeedEmptyState from './FeedEmptyState';
import FeedErrorState from './FeedErrorState';
import FeedJamBanner from '../jam-signature/FeedJamBanner';
import IntersectionSentinel from './IntersectionSentinel';
import { FEED_TAB } from '../../domain/feed/feedTypes';

export default function UnifiedFeed() {
  const { user } = useAuth();
  const userId = user?.id || user?._id;
  const followedIds = useMemo(() => user?.following || [], [user?.following]);

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

  const [visibleCount, setVisibleCount] = useState(10);
  const loadMoreRef = useRef(null);

  const handleLoadMore = useCallback(() => {
    if (hasMore && status !== 'loading') {
      loadMore();
    }
  }, [hasMore, status, loadMore]);

  // Virtualization: only render visible items + buffer
  const visibleItems = useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

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

      {activeTab === FEED_TAB.JAMS && <FeedJamBanner jams={items.filter(i => i.type === 'jam')} />}

      <div className="unified-feed-list">
        {visibleItems.map((item) => (
          <FeedItem key={item.id} item={item} postActions={postActions} currentUserId={userId} />
        ))}
      </div>

      {hasMore && (
        <IntersectionSentinel
          onIntersect={handleLoadMore}
          disabled={status === 'loading'}
        />
      )}

      {status === 'loading' && items.length > 0 && (
        <div className="unified-feed-loading-more">
          <div className="unified-feed-spinner" />
        </div>
      )}
    </div>
  );
}
