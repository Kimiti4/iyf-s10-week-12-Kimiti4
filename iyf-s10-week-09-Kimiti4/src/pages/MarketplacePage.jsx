/**
 * 🛍️ JamiiLink Marketplace - Treasure Hunt!
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import ProductCard from '../components/ProductCard'
import StoreCard from '../components/StoreCard'
import { useToast } from '../components/Toast'
import './MarketplacePage.css'

export default function MarketplacePage() {
  const { user } = useAuth()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('products')
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [stores, setStores] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts)
      setStores(mockStores)
      setLoading(false)
    }, 800)
  }, [])

  const filteredProducts = products.filter(p => 
    !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const filteredStores = stores.filter(s => 
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="marketplace-page">
      <motion.div 
        className="marketplace-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>🛍️ JamiiLink Marketplace</h1>
        <p>Discover treasures from verified sellers in your community! 🎁</p>
      </motion.div>

      <div className="marketplace-search">
        <input
          type="text"
          placeholder="Search for amazing finds... 🔍"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="marketplace-tabs">
        <button
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Products ({filteredProducts.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => setActiveTab('stores')}
        >
          🏪 Stores ({filteredStores.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            className="loading-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="loading-spinner"></div>
            <p>Loading marketplace magic... ✨</p>
          </motion.div>
        ) : activeTab === 'products' ? (
          <motion.div
            key="products"
            className="products-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {filteredProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-illustration">📭</div>
                <h3>No products found</h3>
                <p>Try a different search term!</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="stores"
            className="stores-section"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="verification-banner">
              <span>✅ All stores are verified for your safety!</span>
            </div>
            {filteredStores.length === 0 ? (
              <div className="empty-state">
                <div className="empty-illustration">🏪</div>
                <h3>No stores found</h3>
                <p>Try a different search!</p>
              </div>
            ) : (
              <div className="stores-grid">
                {filteredStores.map((store, index) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <StoreCard store={store} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {user && (
        <motion.button
          className="create-listing-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toast.info('Listing feature coming soon! 🚀')}
        >
          <span className="btn-icon">+</span>
          <span className="btn-text">Sell Something</span>
        </motion.button>
      )}
    </div>
  )
}

const mockProducts = [
  {
    id: '1',
    title: 'Fresh Organic Tomatoes - 5kg Box 🍅',
    description: 'Farm-fresh organic tomatoes harvested daily from Kiambu.',
    price: 400,
    currency: 'KSh',
    type: 'physical',
    seller: { name: 'Kiambu Organic Farms', verified: true, rating: 4.9 }
  },
  {
    id: '2',
    title: 'React Course - Beginner to Advanced ⚛️',
    description: 'Learn React.js with hands-on projects. Includes certificates!',
    price: 2500,
    currency: 'KSh',
    type: 'digital',
    seller: { name: 'TechAcademy KE', verified: true, rating: 4.8 }
  }
]

const mockStores = [
  {
    id: 's1',
    name: 'TechAcademy KE',
    description: 'Leading online education platform for Kenyan tech enthusiasts.',
    category: 'Education',
    verified: true,
    verificationLevel: 'gold',
    rating: 4.8,
    products: 45
  },
  {
    id: 's2',
    name: 'Kiambu Organic Farms',
    description: 'Fresh produce directly from our family farm to your table.',
    category: 'Agriculture',
    verified: true,
    verificationLevel: 'gold',
    rating: 4.9,
    products: 28
  }
]