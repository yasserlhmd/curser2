/**
 * JWT Implementation
 * Custom JWT implementation using Node.js native crypto module
 * No external dependencies - uses built-in crypto for better performance
 * Supports access and refresh tokens with expiration and versioning
 */
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Please set it in your .env file.');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Base64 URL encode (JWT-safe)
 */
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64 URL decode
 */
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (str.length % 4)) % 4;
  str += '='.repeat(padding);
  return Buffer.from(str, 'base64').toString('utf8');
}

/**
 * Generate HMAC signature
 */
function sign(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Verify JWT signature
 */
function verify(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  if (signature !== expectedSignature) {
    throw new Error('Invalid token signature');
  }

  return JSON.parse(base64UrlDecode(encodedPayload));
}

/**
 * Parse expiration time string (e.g., "15m", "7d", "1h")
 */
function parseExpiration(expiresIn) {
  const unit = expiresIn.slice(-1);
  const value = parseInt(expiresIn.slice(0, -1), 10);

  const multipliers = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return value * (multipliers[unit] || 60);
}

/**
 * Generate unique token ID (JTI)
 */
function generateJTI() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate JWT token
 * @param {number} userId - User ID
 * @param {string} email - User email
 * @param {number} tokenVersion - User's token version
 * @param {string} type - Token type: 'access' or 'refresh'
 * @returns {string} JWT token
 */
function generateToken(userId, email, tokenVersion, type = 'access') {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = type === 'refresh' ? JWT_REFRESH_EXPIRES_IN : JWT_EXPIRES_IN;
  const exp = now + parseExpiration(expiresIn);

  const payload = {
    userId,
    email,
    jti: generateJTI(),
    version: tokenVersion,
    type,
    iat: now,
    exp,
  };

  return sign(payload, JWT_SECRET);
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyToken(token) {
  try {
    const decoded = verify(token, JWT_SECRET);
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      throw new Error('Token expired');
    }

    return decoded;
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

/**
 * Extract token from Authorization header
 * @param {Object} req - Express request object
 * @returns {string|null} Token or null
 */
function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

module.exports = {
  generateToken,
  verifyToken,
  getTokenFromRequest,
  generateJTI,
};

