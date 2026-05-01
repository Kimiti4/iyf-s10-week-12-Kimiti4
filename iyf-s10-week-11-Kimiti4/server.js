/**
 * 🔹 Server Entry Point - Week 11
 * Connects to DB first, then starts Express
 */
require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;

// Connect to database, then start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Jamii Link KE API running on port ${PORT}`);
      console.log(`🌐 Frontend: http://localhost:${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log(`🔐 Auth: POST /api/auth/register, /api/auth/login`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, closing DB connection...');
  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});
