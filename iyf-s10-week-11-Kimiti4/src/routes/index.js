/**
 * 🔹 Main Routes Aggregator - Week 11
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const postsRoutes = require('./posts');
const commentsRoutes = require('./comments');
const authRoutes = require('./auth');
const usersRoutes = require('./users');
const locationsRoutes = require('./locations');
const marketRoutes = require('./market');

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: '✅ OK', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Market prices (read-only, no DB needed for demo)
router.get('/market/prices', (req, res) => {
  const MOCK_PRICES = [
    { crop: 'Tomatoes', county: 'Nairobi', pricePerKg: 80, source: 'City Market' },
    { crop: 'Tomatoes', county: 'Kiambu', pricePerKg: 50, source: 'Farm Gate' },
    { crop: 'Kale', county: 'Nairobi', pricePerKg: 30, source: 'City Market' },
    { crop: 'Kale', county: 'Kiambu', pricePerKg: 15, source: 'Farm Gate' }
  ];
  
  const { crop, county } = req.query;
  let prices = [...MOCK_PRICES];
  
  if (crop) prices = prices.filter(p => p.crop.toLowerCase() === crop.toLowerCase());
  if (county) prices = prices.filter(p => p.county.toLowerCase() === county.toLowerCase());
  
  res.json({ success: true, count: prices.length, data: prices });
});

// Locations (static for now)
router.get('/locations', (req, res) => {
  res.json({
    success: true,
    data: {
      settlements: [
        { id: 'kibera', name: 'Kibera', county: 'Nairobi', zones: ['soweto-zone-1', 'soweto-zone-2', 'soweto-zone-3'] },
        { id: 'mathare', name: 'Mathare', county: 'Nairobi', zones: ['mathare-4a', 'mathare-3b'] }
      ],
      counties: ['Nairobi', 'Kiambu', 'Machakos', 'Kajiado', 'Murang\'a']
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/posts', postsRoutes);
// Nested comments: /api/posts/:postId/comments
router.use('/posts/:postId/comments', commentsRoutes);

module.exports = router;
