require('./config/env'); // Load environment variables
const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 5000;

// Test database connection on startup
testConnection().then((connected) => {
  if (connected) {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } else {
    console.error('Failed to connect to database. Server not started.');
    process.exit(1);
  }
});

