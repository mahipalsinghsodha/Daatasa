// backend/config/redis.js
// Redis client with graceful fallback if Redis is not available.
// Used for: distributed rate limiting, caching

const { Redis } = require('ioredis');

let redisClient = null;
let isConnected = false;

const connectRedis = () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.log('[Redis] REDIS_URL not set — using in-memory fallback');
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableReadyCheck:     true,
      lazyConnect:          true,
      retryStrategy(times) {
        if (times > 3) {
          console.error('[Redis] Max retries reached — disabling Redis');
          return null; // Stop retrying
        }
        return Math.min(times * 200, 2000);
      },
    });

    redisClient.on('connect', () => {
      isConnected = true;
      console.log('[Redis] Connected');
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      console.error('[Redis] Error (non-fatal):', err.message);
    });

    redisClient.on('close', () => {
      isConnected = false;
    });

    redisClient.connect().catch((err) => {
      console.warn('[Redis] Failed to connect:', err.message, '— using in-memory fallback');
      redisClient = null;
    });

    return redisClient;
  } catch (err) {
    console.warn('[Redis] Init error:', err.message, '— using in-memory fallback');
    return null;
  }
};

connectRedis();

const getRedis = () => redisClient;
const isRedisConnected = () => isConnected && !!redisClient;

module.exports = { getRedis, isRedisConnected };
