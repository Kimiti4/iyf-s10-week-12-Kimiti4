import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaFire, FaFilter } from 'react-icons/fa';
import JamCard from '../components/jam/JamCard';
import { jamsAPI } from '../services/jamApi';
import { JAM_CATEGORIES } from '../models/jam';

const IDLE = 'idle';
const LOADING = 'loading';
const LOADED = 'loaded';
const ERROR = 'error';

const CATEGORY_OPTIONS = [
  { value: '', label: 'All' },
  ...Object.entries(JAM_CATEGORIES).map(([key, value]) => ({
    value,
    label: key.charAt(0) + key.slice(1).toLowerCase(),
  })),
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'ending', label: 'Ending Soon' },
];

export default function JamFeedPage() {
  const [status, setStatus] = useState(IDLE);
  const [jams, setJams] = useState([]);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchJams = useCallback(async () => {
    setStatus(LOADING);
    setError('');

    try {
      const params = { sort };
      if (category) params.category = category;
      const data = await jamsAPI.getAll(params);
      setJams(data.jams || data || []);
      setStatus(LOADED);
    } catch (err) {
      setError(err.message || 'Failed to load Jams');
      setStatus(ERROR);
    }
  }, [category, sort]);

  useEffect(() => {
    fetchJams();
  }, [fetchJams]);

  return (
    <div className="jam-feed-page">
      <header className="jam-feed-header">
        <div className="jam-feed-title-row">
          <h1 className="jam-feed-title">
            <FaFire className="jam-feed-fire" aria-hidden="true" />
            Jams
          </h1>
          <Link to="/create/jam" className="jam-feed-create-btn">
            + Start a Jam
          </Link>
        </div>

        {/* Filters */}
        <div className="jam-feed-filters">
          <div className="jam-feed-categories" role="tablist" aria-label="Category filter">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                role="tab"
                aria-selected={category === opt.value}
                className={`jam-feed-category ${category === opt.value ? 'active' : ''}`}
                onClick={() => setCategory(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="jam-feed-sort">
            <FaFilter className="jam-feed-sort-icon" aria-hidden="true" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="jam-feed-sort-select"
              aria-label="Sort Jams"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="jam-feed-content">
        {status === LOADING && (
          <div className="jam-feed-loading" aria-label="Loading Jams">
            <div className="jam-feed-spinner" />
          </div>
        )}

        {status === ERROR && (
          <div className="jam-feed-error" role="alert">
            {error}
            <button className="jam-feed-retry" onClick={fetchJams}>
              Try again
            </button>
          </div>
        )}

        {status === LOADED && jams.length === 0 && (
          <div className="jam-feed-empty">
            <p>No Jams found</p>
            <Link to="/create/jam" className="jam-feed-empty-btn">
              Start the first one
            </Link>
          </div>
        )}

        {status === LOADED && jams.length > 0 && (
          <div className="jam-feed-grid">
            {jams.map((jam) => (
              <JamCard key={jam.id || jam._id} jam={jam} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
