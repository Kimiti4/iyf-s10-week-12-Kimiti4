import ActionBar from '../primitives/ActionBar';

export default function ReelActions({ reel, onLike, onUnlike, onSave, onUnsave, onShare, onRepost, onUndoRepost }) {
  return (
    <ActionBar
      isLiked={reel.isLiked}
      likeCount={reel.likeCount}
      onLike={onLike}
      onUnlike={onUnlike}
      isReposted={reel.isReposted}
      repostCount={reel.repostCount}
      onRepost={onRepost}
      onUndoRepost={onUndoRepost}
      commentCount={reel.commentCount}
      isSaved={reel.isSaved}
      onToggleSave={reel.isSaved ? onUnsave : onSave}
      onShare={onShare}
      className="reel-actions"
    />
  );
}
