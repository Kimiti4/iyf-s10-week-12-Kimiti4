/**
 * 🔹 MongoDB Connection Configuration
 * Uses Mongoose ODM
 */
const mongoose = require('mongoose');
require('dotenv').config();

/**
 * Connect to MongoDB database
 */
const connectMongoDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined. Check your .env file.');
    }

    console.log('Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are no longer needed in Mongoose 6+
      // but included for compatibility
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = {
  connectMongoDB,
  mongoose
};
