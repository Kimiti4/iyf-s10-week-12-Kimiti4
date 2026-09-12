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
const metricsRoutes = require('./metrics');
const tiannaraRoutes = require('./tiannara');
const authRoutes = require('./auth');
const alertsRoutes = require('./alerts');
const impactRoutes = require('./impact');
const skillsRoutes = require('./skills');
const reputationRoutes = require('./reputation');
const distributionRoutes = require('./distribution');
const messagesRoutes = require('./messages');
const jamsRoutes = require('./jams');
const { query } = require('../config/postgres');

// Health check
router.get('/health', (req, res) => {
  query('SELECT 1')
    .then(() => res.json({
      status: 'ok',
      db: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage().heapUsed / 1024 / 1024,
      environment: process.env.NODE_ENV || 'development',
      categories: ['mtaani', 'skill', 'farm', 'gig', 'alert']
    }))
    .catch(() => res.status(503).json({ status: 'degraded', db: false }));
});

// Market prices endpoint (FarmLink price transparency)
router.use('/market', marketRoutes);

// Locations endpoint (for geo-filtering)
router.use('/locations', locationsRoutes);

// Mount organizations routes
router.use('/organizations', organizationsRoutes);

// Mount verification routes (unique badge system)
router.use('/verification', verificationRoutes);

// Mount metrics routes (realistic analytics)
router.use('/metrics', metricsRoutes);

// Mount Tiannara AI routes (mental health, fact-checking, moderation)
router.use('/tiannara', tiannaraRoutes);

// Mount alerts routes (realtime verified community alerts)
router.use('/alerts', alertsRoutes);

// Mount auth routes (registration, login)
router.use('/auth', authRoutes);

// Mount posts routes
router.use('/posts', postsRoutes);

// Mount users routes
router.use('/users', usersRoutes);

// R3 [P1-8]: mount previously-unmounted routers with live frontend callers
router.use('/impact', impactRoutes);
router.use('/skills', skillsRoutes);
router.use('/reputation', reputationRoutes);
// R3 [P1-9 U4]: distribution capability does not exist; explicit 501s
router.use('/distribution', distributionRoutes);

// Direct messages
router.use('/messages', messagesRoutes);

// Notifications
router.use('/notifications', require('./notifications'));

// Activity feed (own actions, aggregated from persisted records)
router.use('/activity', require('./activity'));

// Stories (24h ephemeral)
router.use('/stories', require('./stories'));

// Uploads (authenticated image uploads served from public/uploads)
router.use('/uploads', require('./uploads'));

// Jams (flagship creator-led content primitive)
router.use('/jams', jamsRoutes);

module.exports = router;
