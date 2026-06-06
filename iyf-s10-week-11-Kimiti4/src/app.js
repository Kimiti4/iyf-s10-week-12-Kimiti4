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
const { generalLimiter, authLimiter, alertLimiter } = require('./middleware/rateLimiter');
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
        const allowedOrigins = [
            'http://localhost:5173',  // Vite dev server
            'http://localhost:5174',  // Vite dev server (port 5174)
            'http://localhost:3000',  // Local
            'https://jamii-link-ke.vercel.app',  // Production frontend (Vercel)
            process.env.FRONTEND_URL  // Additional production frontend URL
        ].filter(Boolean);
        
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(logger);

// Rate limiting - Apply to main routes
app.use('/api/', generalLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/alerts', alertLimiter);

// 🌐 Serve static frontend files from /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api', routes);

// Health check endpoint (not rate limited)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// SPA Fallback: Send index.html for any non-API routes
// (Allows frontend routing without 404 on refresh)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error Handler (last)
app.use(errorHandler);

module.exports = app;

