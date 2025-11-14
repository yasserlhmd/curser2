/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */
const express = require('express');
const cors = require('./middleware/cors');
const { sendError, sendNotFound } = require('./utils/responseHelpers');
const { ERROR_CODES } = require('./constants/errorCodes');

const app = express();

// ==================== Middleware ====================
// CORS configuration for cross-origin requests
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== Routes ====================
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Task Manager API is running',
    timestamp: new Date().toISOString(),
  });
});

// API route handlers
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// ==================== Error Handling ====================
// Global error handler middleware
app.use((err, req, res, next) => {
  // Log error details (more verbose in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error stack:', err.stack);
  } else {
    console.error('Error:', err.message);
  }
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'development' 
    ? err.message 
    : 'Internal server error';
    
  return sendError(
    res,
    message,
    err.code || ERROR_CODES.INTERNAL_ERROR,
    err.status || 500
  );
});

// 404 handler for unmatched routes
app.use((req, res) => {
  return sendNotFound(res, 'Route');
});

module.exports = app;

