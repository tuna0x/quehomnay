import { redisClient, isRedisAvailable } from '../config/redis.js';
import * as drawService from './drawService.js';
import { pushToDLQ, registerJobHandler } from './dlqService.js';

// In-memory Mutex lock set for hybrid/offline mode
const inMemoryLocks = new Map(); // userId -> timerId

// Stats tracking
let totalDrawsProcessed = 0;
let totalLocksBlocked = 0;
let totalRetries = 0;

/**
 * Attempt to acquire an exclusive lock for a user during a fortune draw
 * Prevents race conditions, double-drawing, and daily limit bypasses
 */
async function acquireDrawLock(userId, ttlMs = 6000) {
  const lockKey = `lock:draw:${userId}`;

  // 1. Try Redis distributed lock if online
  if (isRedisAvailable()) {
    try {
      const acquired = await redisClient.set(lockKey, 'locked', 'PX', ttlMs, 'NX');
      if (acquired === 'OK') return true;
      totalLocksBlocked++;
      return false;
    } catch (err) {
      // Fallback to in-memory lock if Redis query fails
    }
  }

  // 2. Fallback: In-memory mutex lock
  if (inMemoryLocks.has(userId)) {
    totalLocksBlocked++;
    return false;
  }

  const timer = setTimeout(() => {
    inMemoryLocks.delete(userId);
  }, ttlMs);

  inMemoryLocks.set(userId, timer);
  return true;
}

/**
 * Release the draw lock after operation finishes
 */
async function releaseDrawLock(userId) {
  const lockKey = `lock:draw:${userId}`;

  if (isRedisAvailable()) {
    try {
      await redisClient.del(lockKey);
    } catch (err) {}
  }

  const timer = inMemoryLocks.get(userId);
  if (timer) {
    clearTimeout(timer);
    inMemoryLocks.delete(userId);
  }
}

/**
 * Helper to pause execution with promise
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Process fortune draw with concurrency lock, exponential backoff retry, and DLQ routing
 */
export async function enqueueDraw(drawPayload) {
  const { userId } = drawPayload;

  // 1. Acquire mutex lock
  const hasLock = await acquireDrawLock(userId);
  if (!hasLock) {
    const error = new Error('Quẻ của bạn đang được xử lý hoặc có yêu cầu đồng thời. Xin vui lòng chờ giây lát!');
    error.statusCode = 429;
    throw error;
  }

  const maxAttempts = 3;
  let attempt = 0;
  let lastError = null;

  try {
    while (attempt < maxAttempts) {
      attempt++;
      try {
        const result = await drawService.processFortuneDraw(drawPayload);
        totalDrawsProcessed++;
        return result;
      } catch (err) {
        lastError = err;

        // If this is a business rule rejection (e.g. 403 quota exceeded, 400 invalid params), do NOT retry
        if (err.statusCode === 403 || err.statusCode === 400) {
          throw err;
        }

        totalRetries++;
        console.warn(`⚠️ [DrawQueue] Draw attempt ${attempt}/${maxAttempts} failed for user ${userId}: ${err.message}`);

        if (attempt < maxAttempts) {
          // Exponential backoff: 200ms, 600ms, 1200ms
          const backoffDelay = Math.pow(attempt, 2) * 200;
          await sleep(backoffDelay);
        }
      }
    }

    // All retries failed due to system/database errors -> push to DLQ
    await pushToDLQ({
      jobType: 'DRAW_FORTUNE',
      payload: drawPayload,
      error: lastError,
      userId,
      retryCount: maxAttempts,
      maxRetries: 3
    });

    const finalError = new Error('Hệ thống đền thờ đang quá tải tạm thời. Quẻ của bạn đã được đưa vào hàng đợi kiểm duyệt (DLQ). Vui lòng thử lại sau giây lát.');
    finalError.statusCode = 503;
    throw finalError;

  } finally {
    // Always release lock when completed or errored
    await releaseDrawLock(userId);
  }
}

/**
 * Register DLQ retry handler for DRAW_FORTUNE jobs
 */
registerJobHandler('DRAW_FORTUNE', async (payload) => {
  return await drawService.processFortuneDraw(payload);
});

/**
 * Get current draw queue & mutex status for Admin Dashboard
 */
export function getDrawQueueStatus() {
  return {
    activeLocksCount: inMemoryLocks.size,
    totalDrawsProcessed,
    totalLocksBlocked,
    totalRetries
  };
}
