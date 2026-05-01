/**
 * 🔹 Week 10 Entry Point
 * Loads environment and starts Express app
 */
require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`🚀 Jamii Link KE API running in ${NODE_ENV} mode`);
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`📝 Posts: http://localhost:${PORT}/api/posts`);
  console.log(`🌾 Farm Prices: http://localhost:${PORT}/api/market/prices`);
  console.log(`💡 Tip: Use category=mtaani|skill|farm|gig to filter posts`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down gracefully');
  process.exit(0);
});
