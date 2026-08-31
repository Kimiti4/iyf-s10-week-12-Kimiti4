import { useState, useCallback } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

export default function DiscoverySearchBar({ onSearch, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  }, [query, onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
  }, []);

  return (
    <form className="discovery-search" onSubmit={handleSubmit}>
      <FaSearch className="discovery-search-icon" aria-hidden="true" />
      <input
        type="search"
        className="discovery-search-input"
        placeholder="Search posts, reels, jams, people..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search"
      />
      {query && (
        <button type="button" className="discovery-search-clear" onClick={handleClear} aria-label="Clear search">
          <FaTimes />
        </button>
      )}
    </form>
  );
}
