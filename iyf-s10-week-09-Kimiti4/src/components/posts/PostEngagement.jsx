export default function PostEngagement({ post }) {
  const stats = [];

  if (post.likeCount > 0) {
    stats.push({ label: `${post.likeCount} like${post.likeCount !== 1 ? 's' : ''}` });
  }
  if (post.commentCount > 0) {
    stats.push({ label: `${post.commentCount} comment${post.commentCount !== 1 ? 's' : ''}` });
  }
  if (post.repostCount > 0) {
    stats.push({ label: `${post.repostCount} repost${post.repostCount !== 1 ? 's' : ''}` });
  }

  if (stats.length === 0) return null;

  return (
    <div className="post-engagement">
      {stats.map((stat, i) => (
        <span key={i} className="post-engagement-stat">{stat.label}</span>
      ))}
    </div>
  );
}
