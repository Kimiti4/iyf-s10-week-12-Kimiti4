/**
 * 🔹 Main Routes Aggregator
 */
const express = require('express');
const router = express.Router();
const postsRoutes = require('./posts');
const usersRoutes = require('./users');
const locationsRoutes = require('./locations');
const marketRoutes = require('./market');
const organizationsRoutes = require('./organizations');
const verificationRoutes = require('./verification');

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: '✅ OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage().heapUsed / 1024 / 1024,
    environment: process.env.NODE_ENV || 'development',
    categories: ['mtaani', 'skill', 'farm', 'gig', 'alert']
  });
});

// Market prices endpoint (FarmLink price transparency)
router.use('/market', marketRoutes);

// Locations endpoint (for geo-filtering)
router.use('/locations', locationsRoutes);

// Mount organizations routes
router.use('/organizations', organizationsRoutes);

// Mount verification routes (unique badge system)
router.use('/verification', verificationRoutes);

// Mount posts routes
router.use('/posts', postsRoutes);

// Mount users routes
router.use('/users', usersRoutes);

module.exports = router;
