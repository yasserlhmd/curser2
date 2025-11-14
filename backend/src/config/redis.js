/**
 * Redis Configuration
 * Token blacklist storage with persistence
 */
const Redis = require('ioredis');

const redisEnabled = process.env.REDIS_ENABLED !== 'false'; // Default to true

let redis = null;

if (redisEnabled) {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
      // Exponential backoff with max delay
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: false, // Don't queue commands if disconnected
    lazyConnect: true, // Connect on first use
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
    // System continues with token versioning fallback
  });

  redis.on('connect', () => {
    console.log('Redis connected successfully');
  });

  redis.on('ready', () => {
    console.log('Redis is ready');
  });

  redis.on('close', () => {
    console.warn('Redis connection closed');
  });

  // Connect on module load
  redis.connect().catch((err) => {
    console.warn('Redis initial connection failed, will retry:', err.message);
  });
} else {
  console.log('Redis disabled - using token versioning only');
}

module.exports = redis;

