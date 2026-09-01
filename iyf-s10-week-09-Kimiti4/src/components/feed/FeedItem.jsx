import React from 'react';
import { FEED_CONTENT_TYPE } from '../../domain/feed/feedTypes';
import PostCard from '../posts/PostCard';
import JamCard from '../jam/JamCard';
import ReelPreview from './ReelPreview';

export default React.memo(function FeedItem({ item, postActions, currentUserId }) {
  switch (item.type) {
    case FEED_CONTENT_TYPE.POST:
      return (
        <PostCard
          post={item.data}
          actions={postActions}
          contentStatus={item.contentStatus}
          currentUserId={currentUserId}
        />
      );

    case FEED_CONTENT_TYPE.REEL:
      return <ReelPreview reel={item.data} contentStatus={item.contentStatus} />;

    case FEED_CONTENT_TYPE.JAM:
      return <JamCard jam={item.data} contentStatus={item.contentStatus} />;

    default:
      return null;
  }
})
