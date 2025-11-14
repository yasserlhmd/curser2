/**
 * Database Configuration
 * Sets up PostgreSQL connection pool with optimized settings
 */
const { Pool } = require('pg');
require('./env'); // Load environment variables

/**
 * PostgreSQL connection pool configuration
 * Optimized for production use with connection pooling
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'taskmanager_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
});

// ==================== Event Handlers ====================
// Log successful connections
pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Database connected successfully');
  }
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err);
  process.exit(-1);
});

// ==================== Connection Testing ====================
/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful, false otherwise
 */
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    if (process.env.NODE_ENV === 'development') {
      console.log('Database connection test successful:', result.rows[0]);
    }
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection,
};

