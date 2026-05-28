/**
 * Redis Cache Utility — with graceful fallback
 * If Redis is not available, all cache operations are silent no-ops.
 * This ensures the app works 100% even without a Redis server.
 */
const Redis = require('ioredis');

let client = null;
let connected = false;

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

function getClient() {
  if (client) return client;

  try {
    client = new Redis(REDIS_URL, {
      lazyConnect: true,
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 2) {
          console.warn('[Redis] Cannot connect — running without cache.');
          return null; // stop retrying
        }
        return 1000;
      },
    });

    client.on('connect', () => {
      connected = true;
      console.log('[Redis] ✅ Connected to Redis cache');
    });

    client.on('error', (err) => {
      if (connected) console.warn('[Redis] Connection lost:', err.message);
      connected = false;
    });

    client.connect().catch(() => {});
  } catch (e) {
    console.warn('[Redis] Init error:', e.message);
    client = null;
  }

  return client;
}

/**
 * Get a cached JSON value.
 * Returns null if not found or Redis unavailable.
 */
async function getCache(key) {
  try {
    const c = getClient();
    if (!c || !connected) return null;
    const val = await c.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

/**
 * Set a cached JSON value with TTL in seconds.
 * Silent no-op if Redis unavailable.
 */
async function setCache(key, value, ttlSeconds = 300) {
  try {
    const c = getClient();
    if (!c || !connected) return;
    await c.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // silent
  }
}

/**
 * Delete a specific cache key.
 */
async function deleteCache(key) {
  try {
    const c = getClient();
    if (!c || !connected) return;
    await c.del(key);
  } catch {
    // silent
  }
}

/**
 * Delete all analytics cache keys (call after order create/update/cancel).
 */
async function invalidateAnalytics() {
  try {
    const c = getClient();
    if (!c || !connected) return;
    const keys = await c.keys('analytics:*');
    if (keys.length > 0) await c.del(...keys);
  } catch {
    // silent
  }
}

module.exports = { getCache, setCache, deleteCache, invalidateAnalytics };
