/**
 * Native environment variable loader
 * Replaces dotenv with native Node.js fs module
 */
const fs = require('fs');
const path = require('path');

/**
 * Load environment variables from .env file
 */
const loadEnv = () => {
  const envPath = path.resolve(process.cwd(), '.env');
  
  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    console.warn('.env file not found, using system environment variables');
    return;
  }

  try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');

    lines.forEach((line) => {
      // Skip empty lines and comments
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return;
      }

      // Parse KEY=VALUE format
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex === -1) {
        return;
      }

      const key = trimmedLine.substring(0, equalIndex).trim();
      let value = trimmedLine.substring(equalIndex + 1).trim();

      // Remove quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Only set if not already set (system env takes precedence)
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch (error) {
    console.error('Error loading .env file:', error.message);
  }
};

// Auto-load on require
loadEnv();

module.exports = { loadEnv };

