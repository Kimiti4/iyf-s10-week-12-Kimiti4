/**
 * 🔹 Express App Configuration
 * Centralized middleware and routing with security hardening
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const logger = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');
const securityHeaders = require('./middleware/securityHeaders');
const { generalLimiter, alertLimiter } = require('./middleware/rateLimiter');
const routes = require('./routes');

const app = express();

// Trust proxy for deployment
app.set('trust proxy', 1);

// Middleware - Order matters!
// Security headers should be early
app.use(securityHeaders);

// Middleware
// CORS configuration for full-stack deployment
const corsOptions = {
    origin: function (origin, callback) {
        const productionOrigins = [
            'https://jamii-link.ke.vercel.app',
            'https://jamii-link.vercel.app',
            process.env.FRONTEND_URL
        ].filter(Boolean);
        const developmentOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000'
        ];
        const allowedOrigins = process.env.NODE_ENV === 'production'
            ? productionOrigins
            : [...productionOrigins, ...developmentOrigins];
        
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(logger);

// Rate limiting - Apply to main routes
app.use('/api/', generalLimiter);
app.use('/api/alerts', alertLimiter);

// 🌐 Serve static frontend files from /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api', routes);

if (process.env.NODE_ENV === 'staging') {
  const testRoutes = require('./routes/test');
  app.use('/api/test', testRoutes);
}

// R4: unknown /api/* paths must return a truthful JSON 404. Without this,
// the SPA fallback below serves index.html with 200 for unknown API GETs,
// which misrepresents absent capabilities as successful responses.
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
    code: 'API_NOT_FOUND'
  });
});

// Health check endpoint (not rate limited)
app.get('/health', async (req, res) => {
  try {
    const { query } = require('./config/postgres');
    await query('SELECT 1');
    res.json({ status: 'ok', db: true, timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'degraded', db: false });
  }
});

// SPA Fallback: Send index.html for any non-API routes
// (Allows frontend routing without 404 on refresh)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error Handler (last)
app.use(errorHandler);

module.exports = app;

