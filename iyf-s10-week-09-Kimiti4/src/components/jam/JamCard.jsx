import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaClock, FaFire } from 'react-icons/fa';
import AvatarIcon from '../AvatarIcon';
import JamStatusBadge from './JamStatusBadge';
import { JAM_STATUS, JAM_CATEGORIES } from '../../models/jam';

const CATEGORY_LABELS = {
  [JAM_CATEGORIES.CREATOR]: 'Creator',
  [JAM_CATEGORIES.MTAAI]: 'Mtaani',
  [JAM_CATEGORIES.SKILLS]: 'Skills',
  [JAM_CATEGORIES.GIGS]: 'Gigs',
  [JAM_CATEGORIES.FARM]: 'Farm',
  [JAM_CATEGORIES.GAMING]: 'Gaming',
  [JAM_CATEGORIES.MUSIC]: 'Music',
  [JAM_CATEGORIES.CHALLENGE]: 'Challenge',
  [JAM_CATEGORIES.COMMUNITY]: 'Community',
  [JAM_CATEGORIES.OTHER]: 'Other',
};

const CATEGORY_EMOJIS = {
  [JAM_CATEGORIES.CREATOR]: '🎨',
  [JAM_CATEGORIES.MTAAI]: '📍',
  [JAM_CATEGORIES.SKILLS]: '🛠️',
  [JAM_CATEGORIES.GIGS]: '💼',
  [JAM_CATEGORIES.FARM]: '🌱',
  [JAM_CATEGORIES.GAMING]: '🎮',
  [JAM_CATEGORIES.MUSIC]: '🎵',
  [JAM_CATEGORIES.CHALLENGE]: '🏆',
  [JAM_CATEGORIES.COMMUNITY]: '🤝',
  [JAM_CATEGORIES.OTHER]: '📦',
};

function formatDeadline(deadline) {
  if (!deadline) return null;
  const date = new Date(deadline);
  const now = new Date();
  const diffMs = date - now;

  if (diffMs <= 0) return 'Ended';

  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  const minutes = Math.floor(diffMs / 60000);
  return `${minutes}m left`;
}

function formatCreated(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const seconds = Math.floor(diffMs / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function JamCard({ jam }) {
  const deadlineText = useMemo(() => formatDeadline(jam.deadline), [jam.deadline]);
  const createdText = useMemo(() => formatCreated(jam.createdAt), [jam.createdAt]);
  const isActive = jam.status === JAM_STATUS.ACTIVE;
  const participantCount = jam.participantCount || 0;

  return (
    <article className="jam-card" aria-label={`Jam: ${jam.title}`}>
      {/* Header */}
      <div className="jam-card-header">
        <div className="jam-card-author">
          <AvatarIcon
            user={jam.creator || { _id: 'unknown', username: 'Anonymous', profile: {} }}
            size="small"
          />
          <div className="jam-card-author-info">
            <span className="jam-card-author-name">
              {jam.creator?.username || 'Anonymous'}
            </span>
            <span className="jam-card-time">{createdText}</span>
          </div>
        </div>
        <JamStatusBadge status={jam.status} />
      </div>

      {/* Content */}
      <Link to={`/jams/${jam.id || jam._id}`} className="jam-card-content">
        {jam.coverMediaUrl && (
          <div className="jam-card-cover">
            <img src={jam.coverMediaUrl} alt="" loading="lazy" />
          </div>
        )}

        <div className="jam-card-title-row">
          <FaFire className="jam-card-fire" aria-hidden="true" />
          <h3 className="jam-card-title">{jam.title}</h3>
        </div>

        {jam.prompt && (
          <p className="jam-card-prompt">{jam.prompt}</p>
        )}

        {/* Category + Participation Types */}
        <div className="jam-card-meta">
          {jam.category && (
            <span className="jam-card-category">
              {CATEGORY_EMOJIS[jam.category] || '📦'}{' '}
              {CATEGORY_LABELS[jam.category] || jam.category}
            </span>
          )}
          {jam.participationTypes?.length > 0 && (
            <span className="jam-card-types">
              {jam.participationTypes.length} type{jam.participationTypes.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </Link>

      {/* Footer */}
      <div className="jam-card-footer">
        <div className="jam-card-stats">
          <span className="jam-card-stat">
            <FaUsers aria-hidden="true" />
            {participantCount} participant{participantCount !== 1 ? 's' : ''}
          </span>
          {deadlineText && (
            <span className={`jam-card-stat ${deadlineText === 'Ended' ? 'ended' : ''}`}>
              <FaClock aria-hidden="true" />
              {deadlineText}
            </span>
          )}
        </div>

        <Link
          to={`/jams/${jam.id || jam._id}`}
          className={`jam-card-join-btn ${isActive ? 'active' : ''}`}
        >
          {isActive ? 'Join Jam' : 'View Jam'}
        </Link>
      </div>
    </article>
  );
}
