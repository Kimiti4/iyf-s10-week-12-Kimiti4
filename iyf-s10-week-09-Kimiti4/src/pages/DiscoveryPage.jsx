import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDiscovery } from '../hooks/useDiscovery';
import DiscoverySearchBar from '../components/discovery/DiscoverySearchBar';
import TrendingSection from '../components/discovery/TrendingSection';
import CategoryGrid from '../components/discovery/CategoryGrid';
import SuggestedUsers from '../components/discovery/SuggestedUsers';
import PostCard from '../components/posts/PostCard';
import ReelCard from '../components/reels/ReelCard';
import JamCard from '../components/jam/JamCard';
import './DiscoveryPage.css';

const SEARCH_TABS = [
  { id: 'all', label: 'All' },
  { id: 'posts', label: 'Posts' },
  { id: 'reels', label: 'Reels' },
  { id: 'jams', label: 'Jams' },
  { id: 'users', label: 'People' },
];

export default function DiscoveryPage() {
  const {
    searchResults,
    trending,
    forYou,
    categories,
    suggestedUsers,
    status,
    searchQuery,
    search,
    fetchTrending,
    fetchForYou,
    fetchCategories,
    fetchSuggestedUsers,
  } = useDiscovery();

  useEffect(() => {
    fetchTrending();
    fetchForYou();
    fetchCategories();
    fetchSuggestedUsers();
  }, [fetchTrending, fetchForYou, fetchCategories, fetchSuggestedUsers]);

  const handleSearch = (query) => {
    search(query);
  };

  const isSearching = searchQuery.length > 0;

  return (
    <main className="discovery-page" role="main" aria-label="Discovery">
      <header className="discovery-header">
        <h1>Discover</h1>
        <DiscoverySearchBar onSearch={handleSearch} />
      </header>

      <div className="discovery-content">
        {isSearching ? (
          <SearchResults results={searchResults} status={status} query={searchQuery} />
        ) : (
          <>
            <TrendingSection trending={trending} onWindowChange={fetchTrending} />

            <div className="discovery-section">
              <h2>Explore</h2>
              <CategoryGrid categories={categories} />
            </div>

            <SuggestedUsers users={suggestedUsers} />

            {forYou.posts.length > 0 && (
              <div className="discovery-section">
                <h2>For You</h2>
                <div className="discovery-grid">
                  {forYou.posts.slice(0, 6).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function SearchResults({ results, status, query }) {
  const hasResults =
    results.posts.length > 0 ||
    results.reels.length > 0 ||
    results.jams.length > 0 ||
    results.users.length > 0;

  return (
    <div className="search-results" role="search" aria-label={`Search results for ${query}`}>
      {status === 'loading' && <div className="search-loading" aria-live="polite">Searching...</div>}

      {!hasResults && status === 'loaded' && (
        <div className="search-empty" aria-live="polite">
          <p>No results for "{query}"</p>
        </div>
      )}

      {results.users.length > 0 && (
        <div className="search-section">
          <h3>People</h3>
          <div className="search-users">
            {results.users.map((user) => (
              <Link key={user.id || user._id} to={`/profile/${user.id || user._id}`} className="search-user-card">
                <span className="search-user-name">{user.username}</span>
                <span className="search-user-bio">{user.profile?.bio?.substring(0, 40)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.posts.length > 0 && (
        <div className="search-section">
          <h3>Posts</h3>
          <div className="discovery-grid">
            {results.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {results.jams.length > 0 && (
        <div className="search-section">
          <h3>Jams</h3>
          <div className="discovery-grid">
            {results.jams.map((jam) => (
              <JamCard key={jam.id || jam._id} jam={jam} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
