import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let isConnected = false;
let connectionAttempted = false;

export const redisClient = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  connectTimeout: 3000,
  retryStrategy(times) {
    if (times > 3) {
      // Stop retrying to avoid spamming logs when Redis is offline in dev
      return null;
    }
    return Math.min(times * 1000, 3000);
  }
});

redisClient.on('connect', () => {
  isConnected = true;
  console.log('⚡ [Redis] Connected successfully to Redis server!');
});

redisClient.on('ready', () => {
  isConnected = true;
});

redisClient.on('error', (err) => {
  isConnected = false;
  if (!connectionAttempted) {
    console.warn(`⚠️  [Redis] Could not connect to Redis at ${REDIS_URL} (${err.message}).`);
    console.warn('💡 [Redis] Hybrid mode active: Falling back to In-Memory Queue seamlessly.');
  }
});

redisClient.on('close', () => {
  isConnected = false;
});

/**
 * Check if Redis is currently reachable and connected
 */
export function isRedisAvailable() {
  return isConnected;
}

/**
 * Initialize connection to Redis gracefully
 */
export async function initRedis() {
  if (connectionAttempted) return isConnected;
  connectionAttempted = true;

  try {
    await redisClient.connect();
    isConnected = true;
    return true;
  } catch (err) {
    isConnected = false;
    return false;
  }
}
