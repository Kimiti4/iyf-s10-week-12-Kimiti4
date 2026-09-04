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
    console.log('✅ HTTP server created\n');
    
    // Initialize Socket.IO for realtime features
    try {
      initializeSocketIO(server);
      console.log('🔌 Realtime system ready\n');
    } catch (error) {
      console.error('⚠️  Socket.IO initialization failed (non-critical):', error.message);
      console.error('   Server will continue without realtime features\n');
    }
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log('='.repeat(60));
      console.log(` Jamii Link KE API running in ${NODE_ENV} mode`);
      console.log(` Server listening on 0.0.0.0:${PORT}`);
      console.log(` Health: http://0.0.0.0:${PORT}/health`);
      console.log('='.repeat(60));
      console.log(` Alerts: http://0.0.0.0:${PORT}/api/alerts`);
      console.log(` Posts:  http://0.0.0.0:${PORT}/api/posts`);
      console.log(` Orgs:   http://0.0.0.0:${PORT}/api/organizations`);
      console.log('='.repeat(60));
      console.log('✅ SERVER IS READY\n');
    });

    // Handle server errors (critical for debugging)
    server.on('error', (error) => {
      console.error('❌ SERVER ERROR:', error.message);
      console.error('Error code:', error.code);
      console.error('Error address:', error.address);
      console.error('Error port:', error.port);
      console.error('Full error:', JSON.stringify(error, null, 2));
    });

    // Verify server is actually listening
    server.on('listening', () => {
      const addr = server.address();
      console.log('✅ Server confirmed listening on:', addr);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('\n💡 Common issues:');
    console.error('   1. DATABASE_URL not set in .env');
    console.error('   2. PostgreSQL service not running');
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
