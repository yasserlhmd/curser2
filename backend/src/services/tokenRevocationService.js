/**
 * Token Revocation Service
 * Handles token blacklisting (Redis) and token versioning (PostgreSQL)
 */
const redis = require('../config/redis');
const { pool } = require('../config/database');

/**
 * Revoke all tokens for a user (bulk revocation)
 * Increments token_version in database
 * @param {number} userId - User ID
 * @returns {Promise<number>} New token version
 */
async function revokeAllUserTokens(userId) {
  const result = await pool.query(
    'UPDATE users SET token_version = token_version + 1 WHERE id = $1 RETURNING token_version',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  return result.rows[0].token_version;
}

/**
 * Revoke specific token (add to Redis blacklist)
 * @param {string} jti - JWT ID (token identifier)
 * @param {number} userId - User ID
 * @param {Date} expiresAt - Token expiration date
 * @param {string} reason - Revocation reason (logout, security_breach, etc.)
 * @returns {Promise<void>}
 */
async function revokeToken(jti, userId, expiresAt, reason = 'logout') {
  if (!redis) {
    // Redis not available - token will expire naturally
    console.warn('Redis not available, token revocation skipped');
    return;
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const exp = Math.floor(expiresAt.getTime() / 1000);
    const ttl = Math.max(0, exp - now); // Time until expiration

    if (ttl <= 0) {
      // Token already expired, no need to blacklist
      return;
    }

    const tokenData = {
      userId,
      expiresAt: expiresAt.toISOString(),
      reason,
      revokedAt: new Date().toISOString(),
    };

    // Store in Redis with TTL matching token expiration
    await redis.setex(
      `revoked_token:${jti}`,
      ttl,
      JSON.stringify(tokenData)
    );
  } catch (error) {
    console.error('Failed to revoke token in Redis:', error);
    // Don't throw - graceful degradation
  }
}

/**
 * Check if token is revoked
 * @param {string} jti - JWT ID
 * @param {number} userId - User ID
 * @param {number} tokenVersion - Token version from JWT
 * @returns {Promise<boolean>} True if token is revoked
 */
async function isTokenRevoked(jti, userId, tokenVersion) {
  // First check token version (fast database lookup)
  try {
    const userResult = await pool.query(
      'SELECT token_version FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return true; // User doesn't exist
    }

    if (userResult.rows[0].token_version !== tokenVersion) {
      return true; // Token version mismatch
    }
  } catch (error) {
    console.error('Error checking token version:', error);
    return true; // Fail secure
  }

  // Then check Redis blacklist (if Redis available)
  if (redis) {
    try {
      const exists = await redis.exists(`revoked_token:${jti}`);
      if (exists === 1) {
        return true; // Token is blacklisted
      }
    } catch (error) {
      // Redis unavailable - log but continue (graceful degradation)
      console.warn('Redis check failed, using version check only:', error.message);
    }
  }

  return false; // Token is valid
}

/**
 * Check token version matches user's current version
 * @param {number} userId - User ID
 * @param {number} tokenVersion - Token version from JWT
 * @returns {Promise<boolean>} True if version matches
 */
async function checkTokenVersion(userId, tokenVersion) {
  try {
    const result = await pool.query(
      'SELECT token_version FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return false;
    }

    return result.rows[0].token_version === tokenVersion;
  } catch (error) {
    console.error('Error checking token version:', error);
    return false;
  }
}

/**
 * Cleanup expired tokens from Redis (optional - TTL handles this automatically)
 * @returns {Promise<number>} Number of keys deleted
 */
async function cleanupExpiredTokens() {
  if (!redis) {
    return 0;
  }

  try {
    // Redis TTL automatically expires keys, but we can manually clean if needed
    // This is optional since TTL handles expiration
    const keys = await redis.keys('revoked_token:*');
    let deleted = 0;

    for (const key of keys) {
      const ttl = await redis.ttl(key);
      if (ttl === -1) {
        // Key exists but has no TTL (shouldn't happen, but clean it up)
        await redis.del(key);
        deleted++;
      }
    }

    return deleted;
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    return 0;
  }
}

module.exports = {
  revokeAllUserTokens,
  revokeToken,
  isTokenRevoked,
  checkTokenVersion,
  cleanupExpiredTokens,
};

