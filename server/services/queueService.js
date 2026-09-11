import { pool } from '../config/db.js';
import { redisClient, isRedisAvailable } from '../config/redis.js';

// Configuration
const BATCH_SIZE = 50;
const FLUSH_INTERVAL_MS = 2000; // Flush every 2 seconds
const PRESENCE_TTL_SECONDS = 900; // 15 minutes

// In-Memory Buffers
let trafficBatch = [];
let activityBatch = [];
let flushTimer = null;

// Local In-Memory presence map (Fallback when Redis is offline)
const inMemoryPresence = new Map();

/**
 * Enqueue a traffic log for batch insertion into PostgreSQL
 */
export function enqueueTrafficLog(logItem) {
  // Track active presence
  const identifier = logItem.userId || logItem.ip;
  if (identifier) {
    recordLivePresence(identifier);
  }

  trafficBatch.push({
    path: (logItem.path || '/').substring(0, 255),
    method: logItem.method || 'GET',
    ip: logItem.ip || null,
    userAgent: logItem.userAgent || null,
    referrer: logItem.referrer || null,
    userId: logItem.userId || null,
    statusCode: logItem.statusCode || 200,
    responseTimeMs: logItem.responseTimeMs || 0,
    createdAt: new Date()
  });

  if (trafficBatch.length >= BATCH_SIZE) {
    flushTrafficBatch();
  }
}

/**
 * Enqueue an activity log for batch insertion into PostgreSQL
 */
export function enqueueActivityLog(activityItem) {
  activityBatch.push({
    userId: activityItem.userId || null,
    userEmail: activityItem.userEmail || null,
    userName: activityItem.userName || null,
    actionType: activityItem.actionType,
    details: activityItem.details || {},
    ip: activityItem.ip || null,
    createdAt: new Date()
  });

  if (activityBatch.length >= BATCH_SIZE) {
    flushActivityBatch();
  }
}

/**
 * Flush accumulated traffic logs as a single multi-row SQL INSERT query
 */
export async function flushTrafficBatch() {
  if (trafficBatch.length === 0) return;

  const items = trafficBatch;
  trafficBatch = [];

  try {
    const valueClauses = [];
    const params = [];

    items.forEach((item, index) => {
      const baseIndex = index * 9;
      valueClauses.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9})`);
      params.push(
        item.path,
        item.method,
        item.ip,
        item.userAgent,
        item.referrer,
        item.userId,
        item.statusCode,
        item.responseTimeMs,
        item.createdAt
      );
    });

    const query = `
      INSERT INTO traffic_logs (path, method, ip, user_agent, referrer, user_id, status_code, response_time_ms, created_at)
      VALUES ${valueClauses.join(', ')}
    `;

    await pool.query(query, params);
  } catch (err) {
    console.debug('[QueueService] Error flushing traffic batch:', err.message);
  }
}

/**
 * Flush accumulated activity logs as a single multi-row SQL INSERT query
 */
export async function flushActivityBatch() {
  if (activityBatch.length === 0) return;

  const items = activityBatch;
  activityBatch = [];

  try {
    const valueClauses = [];
    const params = [];

    items.forEach((item, index) => {
      const baseIndex = index * 7;
      valueClauses.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7})`);
      params.push(
        item.userId,
        item.userEmail,
        item.userName,
        item.actionType,
        JSON.stringify(item.details),
        item.ip,
        item.createdAt
      );
    });

    const query = `
      INSERT INTO activity_logs (user_id, user_email, user_name, action_type, details, ip, created_at)
      VALUES ${valueClauses.join(', ')}
    `;

    await pool.query(query, params);
  } catch (err) {
    console.debug('[QueueService] Error flushing activity batch:', err.message);
  }
}

/**
 * Record live user presence (Redis key with 15min TTL, or in-memory map)
 */
export async function recordLivePresence(identifier) {
  if (!identifier) return;

  if (isRedisAvailable()) {
    try {
      await redisClient.set(`presence:${identifier}`, '1', 'EX', PRESENCE_TTL_SECONDS);
      return;
    } catch {
      // Fall through to in-memory fallback
    }
  }

  // In-memory presence map
  inMemoryPresence.set(identifier, Date.now());
}

/**
 * Get active presence count (from Redis or in-memory map)
 */
export async function getLivePresenceCount() {
  if (isRedisAvailable()) {
    try {
      const keys = await redisClient.keys('presence:*');
      if (keys && keys.length > 0) {
        return keys.length;
      }
    } catch {
      // Fall through to in-memory fallback
    }
  }

  // Check in-memory map
  const now = Date.now();
  const threshold = now - (PRESENCE_TTL_SECONDS * 1000);
  let activeCount = 0;

  for (const [key, timestamp] of inMemoryPresence.entries()) {
    if (timestamp >= threshold) {
      activeCount++;
    } else {
      inMemoryPresence.delete(key);
    }
  }

  return Math.max(1, activeCount);
}

/**
 * Initialize Queue Service interval workers
 */
export function initQueueService() {
  if (flushTimer) return;

  flushTimer = setInterval(() => {
    flushTrafficBatch();
    flushActivityBatch();
  }, FLUSH_INTERVAL_MS);

  console.log('📦 [QueueService] Batch logging queue initialized (Flush interval: 2s)');
}

/**
 * Flush all remaining items on graceful shutdown
 */
export async function flushAllOnShutdown() {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  console.log('[QueueService] Flushing all pending queue logs to database before shutdown...');
  await flushTrafficBatch();
  await flushActivityBatch();
}
