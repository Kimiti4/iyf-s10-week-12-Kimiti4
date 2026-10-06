import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './MarketplacePage.css';

export default function MarketplacePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main className="marketplace-page" role="main" aria-label="Marketplace">
      <header className="marketplace-header">
        <h1>🛍️ JamiiLink Marketplace</h1>
        <p>Discover products and stores from the community.</p>
      </header>

      <div className="marketplace-search">
        <label htmlFor="marketplace-search">Search marketplace</label>
        <input
          id="marketplace-search"
          type="search"
          placeholder="Search products or stores…"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      <section className="empty-state" role="status" aria-live="polite">
        <div className="empty-illustration" aria-hidden="true">🛍️</div>
        <h2>Marketplace data is unavailable</h2>
        <p>
          The current backend does not expose a real product/store catalogue yet.
          No sample listings are shown so the UI never presents fabricated products,
          prices, sellers, ratings, or inventory as real data.
        </p>
        {searchQuery && <p>Search “{searchQuery}” returned no verified marketplace data.</p>}
      </section>

      {user && (
        <button
          type="button"
          className="create-listing-btn"
          disabled
          title="Marketplace listing creation requires a backend listing service"
        >
          <span className="btn-icon" aria-hidden="true">+</span>
          <span className="btn-text">Sell Something — unavailable</span>
        </button>
      )}
    </main>
  );
}
