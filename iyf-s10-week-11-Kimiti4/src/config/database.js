/**
 * 🔹 MongoDB Connection Configuration
 * Connects to Atlas or local MongoDB
 */
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Validate MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined. Check your .env file or deployment environment variables.');
    }
    
    console.log('Attempting to connect to MongoDB...');
    console.log('MONGODB_URI is set:', !!process.env.MONGODB_URI);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Modern Mongoose doesn't need these options
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Error details:', error);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
