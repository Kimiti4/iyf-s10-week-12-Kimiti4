/**
 * 🔹 Product Card Component
 * Displays individual product in marketplace
 */

import { motion } from 'framer-motion';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const formatPrice = (price, currency) => {
    return `${currency} ${price.toLocaleString()}`;
  };

  const getTypeIcon = (type) => {
    return type === 'digital' ? '💻' : '📦';
  };

  return (
    <motion.div 
      className="product-card"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {/* Product Image */}
      <div className="product-image-container">
        <img 
          src={product.image} 
          alt={product.title}
          className="product-image"
        />
        <div className={`product-type-badge ${product.type}`}>
          {getTypeIcon(product.type)} {product.type === 'digital' ? 'Digital' : 'Physical'}
        </div>
        {product.subscription && (
          <div className="subscription-badge">
            🔄 Subscription
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-description">{product.description}</p>

        {/* Seller Info */}
        <div className="seller-info">
          <span className="seller-name">{product.seller.name}</span>
          {product.seller.verified && (
            <span className="verified-icon" title="Verified Seller">✅</span>
          )}
          <span className="seller-rating">⭐ {product.seller.rating}</span>
        </div>

        {/* Tags */}
        <div className="product-tags">
          {product.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="product-tag">#{tag}</span>
          ))}
        </div>

        {/* Additional Info */}
        <div className="product-meta">
          {product.location && (
            <span className="meta-item">📍 {product.location}</span>
          )}
          {product.delivery && (
            <span className="meta-item">🚚 Delivery Available</span>
          )}
          {product.delivery_time && (
            <span className="meta-item">⏱️ {product.delivery_time}</span>
          )}
        </div>

        {/* Price and Action */}
        <div className="product-footer">
          <div className="product-price">
            <span className="price-amount">{formatPrice(product.price, product.currency)}</span>
            {product.sold && (
              <span className="sold-count">{product.sold} sold</span>
            )}
          </div>
          <button className="buy-button">
            View Details
          </button>
        </div>

        {/* Rating */}
        <div className="product-rating">
          <span className="stars">{'⭐'.repeat(Math.floor(product.rating))}</span>
          <span className="rating-text">{product.rating} ({product.reviews} reviews)</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
