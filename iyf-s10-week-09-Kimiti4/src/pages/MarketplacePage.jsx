import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/primitives/PageHeader';
import EmptyState from '../components/primitives/EmptyState';
import './MarketplacePage.css';

export default function MarketplacePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main className="marketplace-page" role="main" aria-label="Marketplace">
      <PageHeader
        eyebrow="Commerce"
        title="Marketplace"
        subtitle="Products and stores from the community"
      />

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

      <EmptyState
        icon="🛍️"
        title="Marketplace data is unavailable"
        message={
          searchQuery
            ? `No verified results for “${searchQuery}”. The catalogue API is not live yet.`
            : 'The backend does not expose a product catalogue yet. No sample listings are shown so the UI never presents fabricated products or prices.'
        }
      />

      {user && (
        <button
          type="button"
          className="btn btn-secondary create-listing-btn"
          disabled
          title="Listing creation requires a backend listing service"
        >
          Sell something — unavailable
        </button>
      )}
    </main>
  );
}
