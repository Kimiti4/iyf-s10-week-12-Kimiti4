import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { request } from '../services/apiClient';
import ProductCard from '../components/ProductCard';
import StoreCard from '../components/StoreCard';
import './MarketplacePage.css';

export default function MarketplacePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [productRes, storeRes] = await Promise.all([
          request('/marketplace/products'),
          request('/marketplace/stores'),
        ]);
        if (cancelled) return;
        setProducts(Array.isArray(productRes?.data) ? productRes.data : (Array.isArray(productRes) ? productRes : []));
        setStores(Array.isArray(storeRes?.data) ? storeRes.data : (Array.isArray(storeRes) ? storeRes : []));
      } catch (err) {
        if (!cancelled) setError(err.message || 'Marketplace is temporarily unavailable.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = useMemo(
    () => products.filter((p) => !normalizedQuery || String(p.title || '').toLowerCase().includes(normalizedQuery)),
    [products, normalizedQuery]
  );
  const filteredStores = useMemo(
    () => stores.filter((s) => !normalizedQuery || String(s.name || '').toLowerCase().includes(normalizedQuery)),
    [stores, normalizedQuery]
  );

  return (
    <main className="marketplace-page" aria-label="Marketplace">
      <header className="marketplace-header">
        <p className="feature-eyebrow">Community commerce</p>
        <h1>Marketplace</h1>
        <p>Discover products and local sellers available through JamiiLink.</p>
      </header>

      <div className="marketplace-search">
        <label htmlFor="marketplace-search">Search marketplace</label>
        <input
          id="marketplace-search"
          type="search"
          placeholder="Search products or stores"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="marketplace-tabs" role="tablist" aria-label="Marketplace sections">
        <button role="tab" aria-selected={activeTab === 'products'} className={activeTab === 'products' ? 'marketplace-tab active' : 'marketplace-tab'} onClick={() => setActiveTab('products')}>
          Products
        </button>
        <button role="tab" aria-selected={activeTab === 'stores'} className={activeTab === 'stores' ? 'marketplace-tab active' : 'marketplace-tab'} onClick={() => setActiveTab('stores')}>
          Stores
        </button>
      </div>

      {loading && <div className="page-loading" role="status">Loading marketplace…</div>}

      {!loading && error && (
        <div className="page-error" role="alert">
          <h2>Marketplace unavailable</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {!loading && !error && activeTab === 'products' && (
        filteredProducts.length ? (
          <div className="products-grid" aria-live="polite">
            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="page-empty">
            <h2>No products found</h2>
            <p>{normalizedQuery ? 'Try a different search.' : 'There are no marketplace products available yet.'}</p>
          </div>
        )
      )}

      {!loading && !error && activeTab === 'stores' && (
        filteredStores.length ? (
          <div className="stores-grid" aria-live="polite">
            {filteredStores.map((store) => <StoreCard key={store.id} store={store} />)}
          </div>
        ) : (
          <div className="page-empty">
            <h2>No stores found</h2>
            <p>{normalizedQuery ? 'Try a different search.' : 'There are no marketplace stores available yet.'}</p>
          </div>
        )
      )}

      {user && (
        <button className="create-listing-btn" onClick={() => navigate('/marketplace/create')}>
          <span className="btn-icon">+</span>
          <span className="btn-text">Sell something</span>
        </button>
      )}
    </main>
  );
}
