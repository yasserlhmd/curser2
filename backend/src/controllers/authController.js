/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 * Manages user registration, login, logout, and token management
 */
const authService = require('../services/authService');
const tokenRevocationService = require('../services/tokenRevocationService');
const { verifyToken, getTokenFromRequest } = require('../utils/jwt');
const { sendSuccess, sendError, sendValidationError, sendNotFound, sendUnauthorized } = require('../utils/responseHelpers');
const { ERROR_CODES } = require('../constants/errorCodes');

/**
 * Register new user
 * POST /api/auth/register
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    if (!email || !password) {
      return sendValidationError(res, 'Email and password are required');
    }

    // Register user
    const user = await authService.registerUser(email, password, name);

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific errors
    if (error.message.includes('already exists')) {
      return sendError(res, error.message, ERROR_CODES.USER_EXISTS, 409);
    }

    if (error.message.includes('Password must') || error.message.includes('Invalid email')) {
      return sendValidationError(res, error.message);
    }

    return sendError(res, 'Registration failed', ERROR_CODES.INTERNAL_ERROR, 500);
  }
}

/**
 * Login user
 * POST /api/auth/login
 * Returns access and refresh tokens for authenticated requests
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return sendValidationError(res, 'Email and password are required');
    }

    // Login user
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

    return sendSuccess(
      res,
      {
        user,
        accessToken,
        refreshToken,
      },
      'Login successful'
    );
  } catch (error) {
    console.error('Login error:', error);

    if (error.message.includes('Invalid email or password')) {
      return sendUnauthorized(res, error.message);
    }

    return sendError(res, 'Login failed', ERROR_CODES.INTERNAL_ERROR, 500);
  }
}

/**
 * Logout user
 * POST /api/auth/logout
 * Revokes the current access token
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function logout(req, res) {
  try {
    const token = getTokenFromRequest(req);
    
    if (!token) {
      // No token provided, but still return success (client-side cleanup)
      return sendSuccess(res, null, 'Logged out successfully');
    }

    // Verify token before revoking
    try {
      const decoded = verifyToken(token);
      // Add token to blacklist
      const expiresAt = new Date(decoded.exp * 1000);
      await tokenRevocationService.revokeToken(
        decoded.jti,
        decoded.userId,
        expiresAt,
        'logout'
      );
    } catch (error) {
      // Token invalid or expired, but still return success (client will clear it)
      // This allows graceful logout even with expired tokens
    }

    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    // Always return success - token will expire naturally if revocation fails
    return sendSuccess(res, null, 'Logged out successfully');
  }
}

/**
 * Get current user info
 * GET /api/auth/me
 * Returns information about the authenticated user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getMe(req, res) {
  try {
    // User is already attached by authenticateToken middleware
    const user = await authService.getUserById(req.user.id);

    if (!user) {
      return sendNotFound(res, 'User');
    }

    return sendSuccess(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
        last_login: user.last_login,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    return sendError(res, 'Failed to get user info', ERROR_CODES.INTERNAL_ERROR, 500);
  }
}

/**
 * Revoke all user tokens
 * POST /api/auth/revoke-all
 * Invalidates all tokens for the authenticated user by incrementing token version
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function revokeAll(req, res) {
  try {
    const newVersion = await tokenRevocationService.revokeAllUserTokens(req.user.id);

    return sendSuccess(res, {
      message: 'All tokens revoked successfully',
      newTokenVersion: newVersion,
    });
  } catch (error) {
    console.error('Revoke all error:', error);
    return sendError(res, 'Failed to revoke tokens', ERROR_CODES.INTERNAL_ERROR, 500);
  }
}

/**
 * Get all users (for filtering)
 * GET /api/auth/users
 * Returns list of all users for task filtering purposes
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllUsers(req, res) {
  try {
    const users = await authService.getAllUsers();
    return sendSuccess(res, {
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      })),
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return sendError(res, 'Failed to get users', ERROR_CODES.INTERNAL_ERROR, 500);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
  revokeAll,
  getAllUsers,
};

