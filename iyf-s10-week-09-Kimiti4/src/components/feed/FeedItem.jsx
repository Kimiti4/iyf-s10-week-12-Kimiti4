import { FEED_CONTENT_TYPE } from '../../domain/feed/feedTypes';
import PostCard from '../posts/PostCard';
import JamCard from '../jam/JamCard';
import ReelPreview from './ReelPreview';

export default function FeedItem({ item, postActions }) {
  switch (item.type) {
    case FEED_CONTENT_TYPE.POST:
      return <PostCard post={item.data} actions={postActions} />;

    case FEED_CONTENT_TYPE.REEL:
      return <ReelPreview reel={item.data} />;

    case FEED_CONTENT_TYPE.JAM:
      return <JamCard jam={item.data} />;

    default:
      return null;
  }
}
