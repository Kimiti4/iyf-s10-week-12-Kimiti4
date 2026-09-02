import ActionBar from '../primitives/ActionBar';
import ModerationReportButton from '../trust/ModerationReportButton';

export default function PostActions({ post, actions, currentUserId, contentStatus }) {
  const {
    handleLike,
    handleUnlike,
    handleRepost,
    handleUnrepost,
    handleSave,
    handleUnsave,
  } = actions;

  return (
    <ActionBar
      isLiked={post.isLiked}
      likeCount={post.likeCount}
      onLike={() => handleLike(post)}
      onUnlike={() => handleUnlike(post)}
      isReposted={post.isReposted}
      repostCount={post.repostCount}
      onRepost={() => handleRepost(post)}
      onUndoRepost={() => handleUnrepost(post)}
      commentCount={post.commentCount}
      isSaved={post.isSaved}
      onToggleSave={() => post.isSaved ? handleUnsave(post) : handleSave(post)}
      shareableItem={post}
      showReport
      reportButton={
        <ModerationReportButton
          targetType="post"
          targetId={post.id}
          currentUserId={currentUserId}
        />
      }
      className="post-actions"
    />
  );
}
