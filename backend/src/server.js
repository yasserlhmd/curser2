/**
 * Server Entry Point
 * Initializes the Express application and starts the HTTP server
 */
require('./config/env'); // Load environment variables
const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 5000;

/**
 * Initialize server
 * Tests database connection before starting the HTTP server
 */
const startServer = async () => {
  try {
    // Test database connection before starting server
    const connected = await testConnection();
    
    if (!connected) {
      console.error('Failed to connect to database. Server not started.');
      process.exit(1);
    }

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

