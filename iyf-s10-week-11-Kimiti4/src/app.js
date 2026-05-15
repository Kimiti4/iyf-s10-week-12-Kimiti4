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
