/**
 * Express App Configuration
 * Centralized middleware and routing with security hardening
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const logger = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const securityHeaders = require('./middleware/securityHeaders');
const {
  generalLimiter,
  authLimiter,
  alertLimiter,
  verificationLimiter,
} = require('./middleware/rateLimiter');
const routes = require('./routes');

const app = express();

// Trust proxy for deployment
app.set('trust proxy', 1);

// Security headers early
app.use(securityHeaders);

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'https://jamii-link.ke.vercel.app',
      'https://jamii-link.vercel.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger);

// Rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/send-verification', verificationLimiter);
app.use('/api/auth/verify-code', verificationLimiter);
app.use('/api/alerts', alertLimiter);

// Static frontend from /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api', routes);

if (process.env.NODE_ENV === 'staging') {
  const testRoutes = require('./routes/test');
  app.use('/api/test', testRoutes);
}

// Unknown /api/* → structured 404 (never SPA HTML)
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'API endpoint not found',
      code: 'API_NOT_FOUND',
      statusCode: 404,
    },
  });
});

// Health check (not under /api rate limit path quirks)
app.get('/health', async (req, res) => {
  try {
    const { query } = require('./config/postgres');
    await query('SELECT 1');
    res.json({
      status: 'ok',
      db: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  } catch {
    res.status(503).json({ status: 'degraded', db: false });
  }
});

// SPA fallback for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error Handler (last)
app.use(errorHandler);

module.exports = app;
