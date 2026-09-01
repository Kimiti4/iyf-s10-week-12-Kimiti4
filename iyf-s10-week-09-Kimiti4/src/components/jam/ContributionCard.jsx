import { useMemo } from 'react';
import { FaFire, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import AvatarIcon from '../AvatarIcon';
import { CONTRIBUTION_STATUS } from '../../models/jam';
import { formatRelativeTime } from '../../utils/formatTime';

const STATUS_LABELS = {
  [CONTRIBUTION_STATUS.PENDING]: 'Pending review',
  [CONTRIBUTION_STATUS.APPROVED]: 'Approved',
  [CONTRIBUTION_STATUS.REJECTED]: 'Not selected',
  [CONTRIBUTION_STATUS.FEATURED]: 'Featured',
};

const STATUS_COLORS = {
  [CONTRIBUTION_STATUS.PENDING]: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  [CONTRIBUTION_STATUS.APPROVED]: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  [CONTRIBUTION_STATUS.REJECTED]: { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.12)' },
  [CONTRIBUTION_STATUS.FEATURED]: { color: '#ff6b6b', bg: 'rgba(255, 107, 107, 0.12)' },
};

export default function ContributionCard({ contribution }) {
  const author = contribution.user || {
    _id: contribution.userId,
    username: 'Participant',
    profile: {},
  };

  const statusLabel = STATUS_LABELS[contribution.status];
  const statusColor = STATUS_COLORS[contribution.status];

  const createdText = useMemo(
    () => formatRelativeTime(contribution.createdAt),
    [contribution.createdAt]
  );

  return (
    <article className="contribution-card" aria-label={`Contribution by ${author.username}`}>
      {/* Header */}
      <div className="contribution-header">
        <div className="contribution-author">
          <AvatarIcon user={author} size="small" />
          <div className="contribution-author-info">
            <span className="contribution-author-name">{author.username}</span>
            <span className="contribution-time">{createdText}</span>
          </div>
        </div>
        {statusLabel && (
          <span
            className="contribution-status"
            style={{ color: statusColor?.color, background: statusColor?.bg }}
          >
            {contribution.status === CONTRIBUTION_STATUS.FEATURED && (
              <FaFire className="contribution-featured-icon" aria-hidden="true" />
            )}
            {statusLabel}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="contribution-body">
        {contribution.textContent && (
          <p className="contribution-text">{contribution.textContent}</p>
        )}
        {contribution.contentUrl && (
          <div className="contribution-media">
            <img
              src={contribution.contentUrl}
              alt={`Contribution by ${author.username}`}
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="contribution-footer">
        <div className="contribution-votes">
          <button className="contribution-vote-btn" aria-label="Upvote">
            <FaThumbsUp aria-hidden="true" />
            <span>{contribution.voteCount || 0}</span>
          </button>
          <button className="contribution-vote-btn" aria-label="Downvote">
            <FaThumbsDown aria-hidden="true" />
          </button>
        </div>
        <span className="contribution-type-badge">{contribution.type}</span>
      </div>
    </article>
  );
}
