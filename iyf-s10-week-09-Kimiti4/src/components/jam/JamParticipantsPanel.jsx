import { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaSpinner } from 'react-icons/fa';
import AvatarIcon from '../AvatarIcon';
import { participationAPI } from '../../services/jamApi';

const IDLE = 'idle';
const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

export default function JamParticipantsPanel({ jamId, participantCount = 0 }) {
  const [status, setStatus] = useState(IDLE);
  const [participants, setParticipants] = useState([]);
  const [error, setError] = useState('');

  const fetchParticipants = useCallback(async () => {
    if (status === LOADED || status === LOADING) return;
    setStatus(LOADING);

    try {
      const data = await participationAPI.getParticipants(jamId, { limit: 10 });
      setParticipants(data.participants || data || []);
      setStatus(LOADED);
    } catch (err) {
      setError(err.message || 'Failed to load participants');
      setStatus(ERROR);
    }
  }, [jamId, status]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  return (
    <div className="jam-participants-panel">
      <div className="jam-participants-header">
        <FaUsers className="jam-participants-icon" aria-hidden="true" />
        <span className="jam-participants-count">
          {participantCount} participant{participantCount !== 1 ? 's' : ''}
        </span>
      </div>

      {status === LOADING && (
        <div className="jam-participants-loading" aria-label="Loading participants">
          <FaSpinner className="jam-spinner" aria-hidden="true" />
        </div>
      )}

      {status === ERROR && (
        <div className="jam-participants-error" role="alert">
          {error}
        </div>
      )}

      {status === LOADED && participants.length === 0 && (
        <p className="jam-participants-empty">
          Be the first to join this Jam!
        </p>
      )}

      {status === LOADED && participants.length > 0 && (
        <div className="jam-participants-list">
          {participants.map((p) => (
            <div key={p.id || p.userId} className="jam-participant">
              <AvatarIcon
                user={p.user || { _id: p.userId, username: p.username || 'User', profile: {} }}
                size="small"
              />
              <span className="jam-participant-name">
                {p.username || p.user?.username || 'User'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
