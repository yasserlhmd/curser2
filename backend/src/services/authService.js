/**
 * Authentication Service
 * Handles user registration, login, and password management
 * Implements secure password hashing using PBKDF2
 */
const crypto = require('crypto');
const { pool } = require('../config/database');
const { generateToken } = require('../utils/jwt');

// ==================== Password Configuration ====================
const PASSWORD_MIN_LENGTH = 8;
const PBKDF2_ITERATIONS = 100000; // High iteration count for security
const SALT_LENGTH = 32; // 32 bytes = 256 bits
const HASH_LENGTH = 64; // 64 bytes = 512 bits

/**
 * Generate random salt
 */
function generateSalt() {
  return crypto.randomBytes(SALT_LENGTH).toString('hex');
}

/**
 * Hash password using PBKDF2
 * @param {string} password - Plain text password
 * @param {string} salt - Salt string
 * @returns {Promise<string>} Hashed password
 */
function hashPassword(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      PBKDF2_ITERATIONS,
      HASH_LENGTH,
      'sha512',
      (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          resolve(derivedKey.toString('hex'));
        }
      }
    );
  });
}

/**
 * Validate password against hash
 * @param {string} password - Plain text password
 * @param {string} hash - Stored password hash
 * @param {string} salt - Stored salt
 * @returns {Promise<boolean>} True if password matches
 */
async function validatePassword(password, hash, salt) {
  try {
    const computedHash = await hashPassword(password, salt);
    return computedHash === hash;
  } catch (error) {
    console.error('Password validation error:', error);
    return false;
  }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validatePasswordStrength(password) {
  const errors = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Register new user
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @param {string} name - User name (optional)
 * @returns {Promise<Object>} Created user (without password)
 */
async function registerUser(email, password, name = null) {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.errors.join(', '));
  }

  // Check if user already exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (existingUser.rows.length > 0) {
    throw new Error('User with this email already exists');
  }

  // Generate salt and hash password
  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  // Insert user
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, password_salt, name, token_version)
     VALUES ($1, $2, $3, $4, 1)
     RETURNING id, email, name, created_at, token_version`,
    [email.toLowerCase(), passwordHash, salt, name]
  );

  return result.rows[0];
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} { user, accessToken, refreshToken }
 */
async function loginUser(email, password) {
  // Get user by email
  const result = await pool.query(
    'SELECT id, email, password_hash, password_salt, name, token_version FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = result.rows[0];

  // Validate password
  const isValid = await validatePassword(password, user.password_hash, user.password_salt);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Update last login
  await pool.query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  // Generate tokens
  const accessToken = generateToken(user.id, user.email, user.token_version, 'access');
  const refreshToken = generateToken(user.id, user.email, user.token_version, 'refresh');

  // Return user without sensitive data
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User object or null
 */
async function getUserById(userId) {
  const result = await pool.query(
    'SELECT id, email, name, token_version, created_at, last_login FROM users WHERE id = $1',
    [userId]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null
 */
async function getUserByEmail(email) {
  const result = await pool.query(
    'SELECT id, email, name, token_version FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Get all users (for filtering purposes)
 * @returns {Promise<Array>} Array of user objects
 */
async function getAllUsers() {
  const result = await pool.query(
    'SELECT id, email, name, created_at FROM users ORDER BY name, email'
  );
  return result.rows;
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  getUserByEmail,
  getAllUsers,
  validatePassword,
  hashPassword,
  generateSalt,
  validatePasswordStrength,
};

