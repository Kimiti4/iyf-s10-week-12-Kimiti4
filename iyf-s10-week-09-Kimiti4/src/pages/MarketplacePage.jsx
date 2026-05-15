/**
 * 🔹 Enhanced Marketplace Page
 * Features: Products (Digital & Physical), Verified Stores, Strict Verification
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import StoreCard from '../components/StoreCard';
import './MarketplacePage.css';

const MarketplacePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'stores'
  const [productFilter, setProductFilter] = useState('all'); // 'all', 'digital', 'physical'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      setProducts(mockProducts);
      setStores(mockStores);
      setLoading(false);
    }, 500);
  }, []);

  // Filter products based on type and search
  const filteredProducts = products.filter(product => {
    const matchesType = productFilter === 'all' || product.type === productFilter;
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Filter stores based on search
  const filteredStores = stores.filter(store => {
    return !searchQuery || 
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="marketplace-page">
      {/* Header */}
      <motion.div 
        className="marketplace-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>🛒 JamiiLink Marketplace</h1>
        <p>Buy, sell, and discover amazing products from verified local stores</p>
      </motion.div>

      {/* Search Bar */}
      <div className="marketplace-search">
        <input
          type="text"
          placeholder="Search products, stores, or categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      {/* Tabs */}
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
          🏪 Verified Stores ({filteredStores.length})
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            className="loading-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loading-spinner"></div>
            <p>Loading marketplace...</p>
          </motion.div>
        ) : activeTab === 'products' ? (
          <motion.div
            key="products"
            className="products-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Product Type Filters */}
            <div className="product-filters">
              <button
                className={`filter-btn ${productFilter === 'all' ? 'active' : ''}`}
                onClick={() => setProductFilter('all')}
              >
                All Products
              </button>
              <button
                className={`filter-btn ${productFilter === 'digital' ? 'active' : ''}`}
                onClick={() => setProductFilter('digital')}
              >
                💻 Digital
              </button>
              <button
                className={`filter-btn ${productFilter === 'physical' ? 'active' : ''}`}
                onClick={() => setProductFilter('physical')}
              >
                📦 Physical
              </button>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <h3>No products found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
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
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Store Verification Info */}
            <div className="verification-banner">
              <span className="banner-icon">✅</span>
              <div className="banner-content">
                <h4>Verified Stores Only</h4>
                <p>All stores undergo strict verification including business registration, identity checks, and quality reviews to ensure legitimacy and protect buyers.</p>
              </div>
            </div>

            {/* Stores Grid */}
            {filteredStores.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🏪</span>
                <h3>No stores found</h3>
                <p>Try adjusting your search</p>
              </div>
            ) : (
              <div className="stores-grid">
                {filteredStores.map((store, index) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <StoreCard store={store} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Listing Button (Floating) */}
      {user && (
        <motion.button
          className="create-listing-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => alert('Create listing feature coming soon!')}
        >
          <span className="btn-icon">+</span>
          <span className="btn-text">Sell Item</span>
        </motion.button>
      )}
    </div>
  );
};

// Mock Data
const mockProducts = [
  {
    id: '1',
    title: 'Complete React Course - Beginner to Advanced',
    description: 'Learn React.js from scratch with hands-on projects. Includes 50+ hours of video content, source code, and certificates.',
    price: 2500,
    currency: 'KSh',
    type: 'digital',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    seller: {
      id: 's1',
      name: 'TechAcademy KE',
      verified: true,
      rating: 4.8
    },
    rating: 4.9,
    reviews: 156,
    sold: 342,
    tags: ['React', 'JavaScript', 'Web Development'],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Fresh Organic Tomatoes - 5kg Box',
    description: 'Farm-fresh organic tomatoes harvested daily from Kiambu. No pesticides, perfect for home cooking or restaurants.',
    price: 400,
    currency: 'KSh',
    type: 'physical',
    category: 'Food & Produce',
    image: 'https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=800',
    seller: {
      id: 's2',
      name: 'Kiambu Organic Farms',
      verified: true,
      rating: 4.9
    },
    rating: 4.7,
    reviews: 89,
    sold: 567,
    location: 'Kiambu, Nairobi',
    delivery: true,
    tags: ['Organic', 'Tomatoes', 'Fresh'],
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Professional Logo Design Package',
    description: 'Get a custom logo design with 3 concepts, unlimited revisions, and all file formats (PNG, SVG, AI). Perfect for startups!',
    price: 3000,
    currency: 'KSh',
    type: 'digital',
    category: 'Design Services',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800',
    seller: {
      id: 's3',
      name: 'CreativeHub Studios',
      verified: true,
      rating: 4.6
    },
    rating: 4.8,
    reviews: 234,
    sold: 189,
    tags: ['Logo', 'Design', 'Branding'],
    delivery_time: '3-5 days',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Handcrafted Wooden Coffee Table',
    description: 'Beautiful handcrafted coffee table made from sustainable acacia wood. Dimensions: 120x60x45cm. Delivery available in Nairobi.',
    price: 12000,
    currency: 'KSh',
    type: 'physical',
    category: 'Furniture',
    image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800',
    seller: {
      id: 's4',
      name: 'Artisan Woodworks',
      verified: true,
      rating: 4.7
    },
    rating: 4.9,
    reviews: 45,
    sold: 23,
    location: 'Westlands, Nairobi',
    delivery: true,
    tags: ['Furniture', 'Handmade', 'Wood'],
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Python Data Science Bootcamp',
    description: 'Master Python for data science, machine learning, and AI. Includes real-world projects and job placement assistance.',
    price: 4500,
    currency: 'KSh',
    type: 'digital',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
    seller: {
      id: 's1',
      name: 'TechAcademy KE',
      verified: true,
      rating: 4.8
    },
    rating: 4.9,
    reviews: 312,
    sold: 567,
    tags: ['Python', 'Data Science', 'Machine Learning'],
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    title: 'Mixed Vegetable Subscription Box - Weekly',
    description: 'Weekly box of fresh seasonal vegetables directly from our farm. Includes sukuma wiki, spinach, carrots, onions, and more!',
    price: 1500,
    currency: 'KSh',
    type: 'physical',
    category: 'Food & Produce',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
    seller: {
      id: 's5',
      name: 'Green Valley Farmers',
      verified: true,
      rating: 4.8
    },
    rating: 4.6,
    reviews: 178,
    sold: 890,
    location: 'Limuru, Kiambu',
    delivery: true,
    subscription: true,
    tags: ['Vegetables', 'Subscription', 'Organic'],
    createdAt: new Date().toISOString()
  }
];

const mockStores = [
  {
    id: 's1',
    name: 'TechAcademy KE',
    description: 'Leading online education platform offering tech courses for Kenyan students and professionals.',
    category: 'Education & Training',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
    banner: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200',
    verified: true,
    verificationLevel: 'platinum', // bronze, silver, gold, platinum
    rating: 4.8,
    reviews: 1247,
    products: 45,
    followers: 3456,
    joinedDate: '2024-01-15',
    location: 'Nairobi, Kenya',
    responseTime: '< 1 hour',
    completionRate: 98,
    badges: ['Top Seller', 'Fast Responder', 'Quality Assured'],
    contact: {
      email: 'info@techacademy.co.ke',
      phone: '+254 7XX XXX XXX'
    }
  },
  {
    id: 's2',
    name: 'Kiambu Organic Farms',
    description: 'Family-owned organic farm providing fresh produce to Nairobi households and restaurants since 2020.',
    category: 'Agriculture & Food',
    logo: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400',
    banner: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200',
    verified: true,
    verificationLevel: 'gold',
    rating: 4.9,
    reviews: 892,
    products: 28,
    followers: 2134,
    joinedDate: '2023-06-20',
    location: 'Kiambu, Kenya',
    responseTime: '< 2 hours',
    completionRate: 99,
    badges: ['Certified Organic', 'Fast Delivery', 'Eco-Friendly'],
    contact: {
      email: 'orders@kiambuorganic.co.ke',
      phone: '+254 7XX XXX XXX'
    }
  },
  {
    id: 's3',
    name: 'CreativeHub Studios',
    description: 'Full-service creative agency specializing in branding, web design, and digital marketing for SMEs.',
    category: 'Design & Creative',
    logo: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
    banner: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200',
    verified: true,
    verificationLevel: 'gold',
    rating: 4.6,
    reviews: 567,
    products: 15,
    followers: 1890,
    joinedDate: '2023-09-10',
    location: 'Westlands, Nairobi',
    responseTime: '< 3 hours',
    completionRate: 96,
    badges: ['Professional', 'Quick Turnaround'],
    contact: {
      email: 'hello@creativehub.co.ke',
      phone: '+254 7XX XXX XXX'
    }
  },
  {
    id: 's4',
    name: 'Artisan Woodworks',
    description: 'Handcrafted furniture and home decor made from sustainable Kenyan hardwood by skilled local artisans.',
    category: 'Furniture & Home',
    logo: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
    banner: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1200',
    verified: true,
    verificationLevel: 'silver',
    rating: 4.7,
    reviews: 234,
    products: 32,
    followers: 987,
    joinedDate: '2024-02-05',
    location: 'Karen, Nairobi',
    responseTime: '< 4 hours',
    completionRate: 95,
    badges: ['Handmade', 'Sustainable'],
    contact: {
      email: 'info@artisanwood.co.ke',
      phone: '+254 7XX XXX XXX'
    }
  },
  {
    id: 's5',
    name: 'Green Valley Farmers',
    description: 'Cooperative of small-scale farmers delivering fresh, affordable produce directly from farm to your door.',
    category: 'Agriculture & Food',
    logo: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
    banner: 'https://images.unsplash.com/photo-1595855709915-fa457bd60e41?w=1200',
    verified: true,
    verificationLevel: 'gold',
    rating: 4.8,
    reviews: 1456,
    products: 52,
    followers: 4567,
    joinedDate: '2023-03-15',
    location: 'Limuru, Kiambu',
    responseTime: '< 1 hour',
    completionRate: 97,
    badges: ['Top Seller', 'Subscription Service', 'Community Favorite'],
    contact: {
      email: 'subscriptions@greenvalley.co.ke',
      phone: '+254 7XX XXX XXX'
    }
  }
];

export default MarketplacePage;
