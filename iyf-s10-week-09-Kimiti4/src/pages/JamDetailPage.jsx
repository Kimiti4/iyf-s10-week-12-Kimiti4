import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaClock, FaFire } from 'react-icons/fa';
import AvatarIcon from '../components/AvatarIcon';
import JamStatusBadge from '../components/jam/JamStatusBadge';
import JamParticipantsPanel from '../components/jam/JamParticipantsPanel';
import JamLeaderboard from '../components/jam/JamLeaderboard';
import ContributionComposer from '../components/jam/ContributionComposer';
import ContributionCard from '../components/jam/ContributionCard';
import ParticipationStats from '../components/analytics/ParticipationStats';
import JoinJamModal from '../components/jam/JoinJamModal';
import { jamsAPI, participationAPI, contributionAPI } from '../services/jamApi';
import { JAM_STATUS, isJamOpen, isJamEnded } from '../models/jam';
import '../components/jam/jam.css';
import './JamDetailPage.css';

const IDLE = 'idle';
const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

export default function JamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [jam, setJam] = useState(null);
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [contributions, setContributions] = useState([]);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const fetchJam = useCallback(async () => {
    setStatus(LOADING);
    try {
      const data = await jamsAPI.getById(id);
      setJam(data.jam || data);
      setStatus(LOADED);
    } catch (err) {
      setError(err.message || 'Failed to load Jam');
      setStatus(ERROR);
    }
  }, [id]);

  const checkMembership = useCallback(async () => {
    try {
      const data = await participationAPI.checkMembership(id);
      setIsMember(data.isMember || data.joined || false);
    } catch {
      setIsMember(false);
    }
  }, [id]);

  const fetchContributions = useCallback(async () => {
    try {
      const data = await contributionAPI.getByJam(id);
      setContributions(data.contributions || data || []);
    } catch {
      setContributions([]);
    }
  }, [id]);

  useEffect(() => {
    fetchJam();
    checkMembership();
    fetchContributions();
  }, [fetchJam, checkMembership, fetchContributions]);

  const handleJoin = useCallback(() => {
    setIsMember(true);
    fetchContributions();
  }, [fetchContributions]);

  const handleLeave = useCallback(async () => {
    try {
      await participationAPI.leave(id);
      setIsMember(false);
    } catch {
      // ignore
    }
  }, [id]);

  const canContribute = isMember && isJamOpen(jam);

  if (status === LOADING) {
    return (
      <div className="jam-detail-loading">
        <div className="jam-detail-spinner" />
      </div>
    );
  }

  if (status === ERROR) {
    return (
      <div className="jam-detail-error" role="alert">
        {error}
        <button onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  if (!jam) return null;

  const deadline = jam.deadline ? new Date(jam.deadline) : null;
  const deadlineText = deadline
    ? deadline.toLocaleDateString('en-KE', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="jam-detail-page">
      {/* Header */}
      <header className="jam-detail-top">
        <button className="jam-detail-back" onClick={() => navigate(-1)} aria-label="Go back">
          <FaArrowLeft />
        </button>
        <JamStatusBadge status={jam.status} />
      </header>

      {/* Hero */}
      {jam.coverMediaUrl && (
        <div className="jam-detail-cover">
          <img src={jam.coverMediaUrl} alt="" />
        </div>
      )}

      <div className="jam-detail-body">
        {/* Title + Creator */}
        <div className="jam-detail-header">
          <h1 className="jam-detail-title">
            <FaFire className="jam-detail-fire" aria-hidden="true" />
            {jam.title}
          </h1>
          <div className="jam-detail-creator">
            <AvatarIcon
              user={jam.creator || { _id: 'unknown', username: 'Anonymous', profile: {} }}
              size="small"
            />
            <span>{jam.creator?.username || 'Anonymous'}</span>
          </div>
        </div>

        {/* Prompt */}
        {jam.prompt && (
          <p className="jam-detail-prompt">{jam.prompt}</p>
        )}

        {/* Description */}
        {jam.description && (
          <p className="jam-detail-description">{jam.description}</p>
        )}

        {/* Stats */}
        <div className="jam-detail-stats">
          <span className="jam-detail-stat">
            <FaUsers aria-hidden="true" />
            {jam.participantCount || 0} participants
          </span>
          {deadlineText && (
            <span className="jam-detail-stat">
              <FaClock aria-hidden="true" />
              Ends {deadlineText}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="jam-detail-actions">
          {isJamOpen(jam) && !isMember && (
            <button className="jam-detail-join-btn" onClick={() => setShowJoinModal(true)}>
              Join Jam
            </button>
          )}
          {isMember && !isJamEnded(jam) && (
            <button className="jam-detail-leave-btn" onClick={handleLeave}>
              Leave Jam
            </button>
          )}
        </div>

        {/* Contribution Composer */}
        {canContribute && (
          <ContributionComposer
            jamId={id}
            participationTypes={jam.participationTypes}
            onSubmitted={fetchContributions}
          />
        )}

        {/* Two-column layout for participants + leaderboard */}
        <div className="jam-detail-sidebar-row">
          <JamParticipantsPanel jamId={id} participantCount={jam.participantCount} />
          <JamLeaderboard jamId={id} />
        </div>

        {/* Analytics */}
        <ParticipationStats jamId={id} />

        {/* Contributions */}
        <section className="jam-detail-contributions">
          <h2 className="jam-detail-section-title">
            Contributions ({contributions.length})
          </h2>
          {contributions.length === 0 && (
            <p className="jam-detail-empty">
              No contributions yet. Be the first!
            </p>
          )}
          <div className="jam-detail-contributions-list">
            {contributions.map((c) => (
              <ContributionCard key={c.id || c._id} contribution={c} />
            ))}
          </div>
        </section>
      </div>

      {/* Join Modal */}
      <JoinJamModal
        jam={jam}
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoined={handleJoin}
      />
    </div>
  );
}
