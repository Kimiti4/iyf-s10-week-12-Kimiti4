/**
 * 🔹 PostgreSQL Connection Configuration
 * Uses node-postgres (pg) library
 */
const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return error after 5 seconds if cannot connect
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

/**
 * Connect to PostgreSQL database
 */
const connectDB = async () => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not defined. Check your .env file.');
    }

    console.log('Attempting to connect to PostgreSQL...');
    
    const client = await pool.connect();
    console.log(`✅ PostgreSQL Connected successfully`);
    client.release();
    
    return pool;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
};

/**
 * Execute a query with parameterized values (prevents SQL injection)
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 */
const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);
  
  // Monkey patch the release method to clear the timeout
  client.release = () => {
    clearTimeout(timeout);
    client.release = release;
    return client.release();
  };
  
  return client;
};

module.exports = {
  pool,
  connectDB,
  query,
  getClient
};
