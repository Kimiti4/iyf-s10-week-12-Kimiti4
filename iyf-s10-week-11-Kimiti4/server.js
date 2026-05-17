/**
 * 🔹 Week 10 Entry Point
 * Loads environment and starts Express app with Socket.IO
 */
require('dotenv').config();
const http = require('http');
const { connectDB } = require('./src/config/postgres');
const { createTables } = require('./src/database/schema');
const app = require('./src/app');
const { initializeSocketIO } = require('./src/services/socketService');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Connect to PostgreSQL first, then start server
const startServer = async () => {
  try {
    console.log('🔧 Starting Jamii Link KE API...');
    console.log(`📍 Working directory: ${process.cwd()}`);
    console.log(`🌍 NODE_ENV: ${NODE_ENV}`);
    console.log(`🔑 PORT: ${PORT}`);
    console.log(`💾 DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'NOT SET'}`);
    
    await connectDB();
    console.log('✅ Database connected successfully\n');
    
    // Create tables if they don't exist (idempotent)
    await createTables();
    console.log('✅ Database schema initialized\n');
    
    // Create HTTP server
    const server = http.createServer(app);
    
    // Initialize Socket.IO for realtime features
    initializeSocketIO(server);
    console.log('🔌 Realtime system ready\n');
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Jamii Link KE API running in ${NODE_ENV} mode`);
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/api/health`);
      console.log(`🏢 Organizations: http://localhost:${PORT}/api/organizations`);
      console.log(` Posts: http://localhost:${PORT}/api/posts`);
      console.log(`👥 Users: http://localhost:${PORT}/api/users`);
      console.log(`🌾 Farm Prices: http://localhost:${PORT}/api/market/prices`);
      console.log(`🚨 Alerts: http://localhost:${PORT}/api/alerts`);
      console.log(`💡 Tip: Use category=mtaani|skill|farm|gig to filter posts`);
      console.log(`🔑 Create org: POST /api/organizations with auth token`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('\n💡 Common issues:');
    console.error('   1. DATABASE_URL not set in Railway environment variables');
    console.error('   2. PostgreSQL service not connected to this service');
    console.error('   3. Invalid connection string format');
    console.error('   4. Database service is down or unreachable');
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down gracefully');
  process.exit(0);
});
