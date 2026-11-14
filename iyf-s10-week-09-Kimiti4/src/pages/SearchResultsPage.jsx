/**
 * Search Results — uses discovery search when available; never shows fabricated posts.
 */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PageHeader from '../components/primitives/PageHeader';
import EmptyState from '../components/primitives/EmptyState';
import ErrorState from '../components/primitives/ErrorState';
import { request } from '../services/apiClient';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();

  const [results, setResults] = useState({ posts: [], users: [], jams: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const performSearch = useCallback(async (searchQuery) => {
    setLoading(true);
    setError('');
    try {
      const res = await request(`/search?q=${encodeURIComponent(searchQuery)}&limit=30`);
      const data = res.data || res;
      setResults({
        posts: data.posts || data.items || [],
        users: data.users || [],
        jams: data.jams || [],
      });
    } catch (err) {
      if (err?.status === 404 || err?.code === 'API_NOT_FOUND') {
        setResults({ posts: [], users: [], jams: [] });
      } else {
        setError(err?.message || 'Search failed');
        setResults({ posts: [], users: [], jams: [] });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query) performSearch(query);
    else {
      setResults({ posts: [], users: [], jams: [] });
      setError('');
    }
  }, [query, performSearch]);

  const total =
    (results.posts?.length || 0) +
    (results.users?.length || 0) +
    (results.jams?.length || 0);

  if (!query) {
    return (
      <main className="search-results-page" role="main" aria-label="Search">
        <PageHeader
          eyebrow="Search"
          title="Search"
          subtitle="Find posts, people, and jams"
        />
        <EmptyState
          icon="🔍"
          title="Enter a search term"
          message="Use the search bar or add ?q= to the URL"
          action={{ label: 'Go to Discover', onClick: () => { window.location.href = '/discover'; } }}
        />
      </main>
    );
  }

  return (
    <main className="search-results-page" role="main" aria-label="Search results">
      <PageHeader
        eyebrow="Search"
        title="Results"
        subtitle={`Showing matches for “${query}”`}
      />

      {loading && (
        <div className="search-loading" role="status">
          <div className="loading-spinner" aria-hidden="true" />
          <p>Searching…</p>
        </div>
      )}

      {!loading && error && (
        <ErrorState error={error} onRetry={() => performSearch(query)} />
      )}

      {!loading && !error && total === 0 && (
        <EmptyState
          icon="📭"
          title="No results"
          message="Try different keywords or browse the feed"
          action={{ label: 'Open Discover', onClick: () => { window.location.href = '/discover'; } }}
        />
      )}

      {!loading && !error && total > 0 && (
        <div className="results-sections">
          {results.users?.length > 0 && (
            <section aria-label="People">
              <h2 className="results-section-title">People</h2>
              <ul className="results-list">
                {results.users.map((u) => (
                  <li key={u.id || u._id}>
                    <Link to={`/profile/${u.id || u._id}`} className="result-card">
                      <strong>{u.username || u.name}</strong>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {results.posts?.length > 0 && (
            <section aria-label="Posts">
              <h2 className="results-section-title">Posts</h2>
              <ul className="results-list">
                {results.posts.map((post) => (
                  <li key={post.id || post._id}>
                    <Link to={`/posts/${post.id || post._id}`} className="result-card">
                      <strong>{post.title || 'Post'}</strong>
                      <p className="result-preview">
                        {(post.content || '').slice(0, 120)}
                        {(post.content || '').length > 120 ? '…' : ''}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {results.jams?.length > 0 && (
            <section aria-label="Jams">
              <h2 className="results-section-title">Jams</h2>
              <ul className="results-list">
                {results.jams.map((jam) => (
                  <li key={jam.id || jam._id}>
                    <Link to={`/jams/${jam.id || jam._id}`} className="result-card">
                      <strong>{jam.title}</strong>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
