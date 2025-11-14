/**
 * Script to create mock users for testing
 * Updated for NestJS - uses bcrypt instead of PBKDF2
 * Run with: node scripts/createMockUsers.js
 */
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    }
  });
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'taskmanager_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const SALT_ROUNDS = parseInt(process.env.PASSWORD_SALT_ROUNDS || '10', 10);

/**
 * Hash password using bcrypt (matches NestJS implementation)
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

const mockUsers = [
  { email: 'john@example.com', password: 'Test1234', name: 'John Doe' },
  { email: 'jane@example.com', password: 'Test1234', name: 'Jane Smith' },
  { email: 'admin@example.com', password: 'Admin123', name: 'Admin User' },
  { email: 'alice@example.com', password: 'User1234', name: 'Alice Johnson' },
  { email: 'bob@example.com', password: 'User1234', name: 'Bob Williams' },
];

async function createMockUsers() {
  try {
    console.log('Creating mock users (using bcrypt for NestJS)...\n');

    for (const user of mockUsers) {
      // Check if user already exists
      const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [user.email.toLowerCase()]
      );

      if (existing.rows.length > 0) {
        console.log(`User ${user.email} already exists, deleting and recreating with bcrypt...`);
        // Delete existing user to recreate with bcrypt
        await pool.query('DELETE FROM users WHERE email = $1', [user.email.toLowerCase()]);
      }

      // Hash password using bcrypt (bcrypt includes salt in hash)
      const passwordHash = await hashPassword(user.password);
      const passwordSalt = ''; // bcrypt includes salt in hash, so we store empty string

      // Insert user
      const result = await pool.query(
        `INSERT INTO users (email, password_hash, password_salt, name, token_version)
         VALUES ($1, $2, $3, $4, 1)
         RETURNING id, email, name`,
        [user.email.toLowerCase(), passwordHash, passwordSalt, user.name]
      );

      console.log(`✅ Created user: ${result.rows[0].email} (${result.rows[0].name})`);
      console.log(`   Password: ${user.password}\n`);
    }

    console.log('All mock users created successfully!');
    console.log('\nTest credentials:');
    console.log('==================');
    mockUsers.forEach(user => {
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Name: ${user.name}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error creating mock users:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createMockUsers();

