/**
 * Authentication Middleware
 * Verifies JWT tokens and checks revocation status
 */
const { verifyToken, getTokenFromRequest } = require('../utils/jwt');
const { getUserById } = require('../services/authService');
const { isTokenRevoked } = require('../services/tokenRevocationService');

/**
 * Authenticate token middleware
 * Verifies JWT, checks token version, and checks Redis blacklist
 */
async function authenticateToken(req, res, next) {
  try {
    // 1. Extract token from request
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No token provided',
          code: 'NO_TOKEN'
        }
      });
    }

    // 2. Verify JWT signature and expiration
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        }
      });
    }

    // 3. Check if token is revoked (version check + Redis blacklist)
    const revoked = await isTokenRevoked(decoded.jti, decoded.userId, decoded.version);
    if (revoked) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token has been revoked',
          code: 'TOKEN_REVOKED'
        }
      });
    }

    // 4. Get user to ensure they still exist
    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    // 5. Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    req.token = decoded;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Authentication failed',
        code: 'AUTH_ERROR'
      }
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token is present and valid, but doesn't require it
 * Used for public routes that can benefit from user context (e.g., showing "My Tasks" filter)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function optionalAuth(req, res, next) {
  try {
    const token = getTokenFromRequest(req);
    if (token) {
      try {
        const decoded = verifyToken(token);
        const revoked = await isTokenRevoked(decoded.jti, decoded.userId, decoded.version);
        if (!revoked) {
          const user = await getUserById(decoded.userId);
          if (user) {
            req.user = {
              id: user.id,
              email: user.email,
              name: user.name,
            };
            req.token = decoded;
          }
        }
      } catch (error) {
        // Token invalid or expired, but continue without user (public access)
      }
    }
    next();
  } catch (error) {
    // Continue without authentication (graceful degradation)
    next();
  }
}

module.exports = {
  authenticateToken,
  optionalAuth,
};

