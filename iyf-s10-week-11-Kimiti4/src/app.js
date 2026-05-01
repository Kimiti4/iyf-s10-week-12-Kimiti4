/**
 * 🔹 Express App Configuration
 * Centralized middleware and routing
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const logger = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// Trust proxy for deployment
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// 🌐 Serve static frontend files from /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api', routes);

// SPA Fallback: Send index.html for any non-API routes
// (Allows frontend routing without 404 on refresh)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error Handler (last)
app.use(errorHandler);

module.exports = app;
