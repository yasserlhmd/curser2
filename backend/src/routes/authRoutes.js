/**
 * Authentication Routes
 * Defines HTTP endpoints for user authentication and management
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// ==================== Public Routes ====================
// POST /api/auth/register - Register new user
router.post('/register', authController.register);

// POST /api/auth/login - Login user (returns access and refresh tokens)
router.post('/login', authController.login);

// POST /api/auth/logout - Logout user (revokes current token)
router.post('/logout', authController.logout); // Can be called without auth (client-side cleanup)

// ==================== Protected Routes ====================
// GET /api/auth/me - Get current user information
router.get('/me', authenticateToken, authController.getMe);

// GET /api/auth/users - Get all users (for task filtering)
router.get('/users', authenticateToken, authController.getAllUsers);

// POST /api/auth/revoke-all - Revoke all user tokens (security feature)
router.post('/revoke-all', authenticateToken, authController.revokeAll);

module.exports = router;

