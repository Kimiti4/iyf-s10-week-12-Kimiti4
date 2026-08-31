import { useState, useEffect, useCallback } from 'react';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import AvatarIcon from '../AvatarIcon';
import { leaderboardAPI } from '../../services/jamApi';

const IDLE = 'idle';
const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

const RANK_ICONS = ['', '🥇', '🥈', '🥉'];

export default function JamLeaderboard({ jamId }) {
  const [status, setStatus] = useState(IDLE);
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');

  const fetchLeaderboard = useCallback(async () => {
    setStatus(LOADING);
    try {
      const data = await leaderboardAPI.getLeaderboard(jamId, { limit: 10 });
      setEntries(data.leaderboard || data || []);
      setStatus(LOADED);
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard');
      setStatus(ERROR);
    }
  }, [jamId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  if (status === LOADING) {
    return (
      <div className="jam-leaderboard">
        <div className="jam-leaderboard-header">
          <FaTrophy aria-hidden="true" />
          <span>Leaderboard</span>
        </div>
        <div className="jam-leaderboard-loading">Loading...</div>
      </div>
    );
  }

  if (status === ERROR) {
    return (
      <div className="jam-leaderboard">
        <div className="jam-leaderboard-header">
          <FaTrophy aria-hidden="true" />
          <span>Leaderboard</span>
        </div>
        <div className="jam-leaderboard-error" role="alert">{error}</div>
      </div>
    );
  }

  return (
    <div className="jam-leaderboard">
      <div className="jam-leaderboard-header">
        <FaTrophy aria-hidden="true" />
        <span>Leaderboard</span>
      </div>

      {entries.length === 0 && (
        <p className="jam-leaderboard-empty">No contributions yet</p>
      )}

      {entries.length > 0 && (
        <ol className="jam-leaderboard-list">
          {entries.map((entry, index) => (
            <li key={entry.userId} className="jam-leaderboard-entry">
              <span className="jam-leaderboard-rank">
                {RANK_ICONS[entry.rank] || entry.rank}
              </span>
              <AvatarIcon
                user={{ _id: entry.userId, username: entry.username, profile: { avatar: entry.avatarUrl } }}
                size="small"
              />
              <div className="jam-leaderboard-info">
                <span className="jam-leaderboard-name">{entry.username}</span>
                <span className="jam-leaderboard-stats">
                  {entry.contributionCount} contribution{entry.contributionCount !== 1 ? 's' : ''} · {entry.voteCount} votes
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
