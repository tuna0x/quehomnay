import { pool } from '../config/db.js';

// In-memory DLQ fallback in case PostgreSQL is temporarily unreachable
const inMemoryDLQ = [];
let inMemoryIdCounter = 1;

// Job handler registry for retrying failed jobs
const jobHandlers = new Map();

/**
 * Register a handler function to be executed when a failed job is retried
 * @param {string} jobType - e.g. 'DRAW_FORTUNE', 'AI_GENERATION'
 * @param {Function} handler - async (payload) => Promise<any>
 */
export function registerJobHandler(jobType, handler) {
  jobHandlers.set(jobType, handler);
}

/**
 * Push a failed task into the Dead Letter Queue (DLQ)
 */
export async function pushToDLQ({
  jobType,
  payload = {},
  error = null,
  userId = null,
  retryCount = 0,
  maxRetries = 3
}) {
  const errorMessage = error?.message || (typeof error === 'string' ? error : 'Lỗi không xác định');
  const errorStack = error?.stack || null;

  console.error(`🚨 [DLQ] Pushing job to Dead Letter Queue: [${jobType}] User: ${userId || 'guest'} - Error: ${errorMessage}`);

  try {
    const res = await pool.query(`
      INSERT INTO failed_jobs (
        job_type, payload, error_message, error_stack, retry_count, max_retries, status, user_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'failed', $7, NOW(), NOW())
      RETURNING *;
    `, [
      jobType,
      JSON.stringify(payload),
      errorMessage,
      errorStack,
      retryCount,
      maxRetries,
      userId
    ]);

    return res.rows[0];
  } catch (dbErr) {
    console.warn(`⚠️ [DLQ] Could not write to failed_jobs table (${dbErr.message}). Storing in memory fallback.`);
    const memoryJob = {
      id: `mem_${inMemoryIdCounter++}`,
      job_type: jobType,
      payload,
      error_message: errorMessage,
      error_stack: errorStack,
      retry_count: retryCount,
      max_retries: maxRetries,
      status: 'failed',
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_in_memory: true
    };
    inMemoryDLQ.unshift(memoryJob);
    if (inMemoryDLQ.length > 200) inMemoryDLQ.pop();
    return memoryJob;
  }
}

/**
 * Retrieve paginated failed jobs with filters
 */
export async function getFailedJobs({
  page = 1,
  limit = 20,
  status = '',
  jobType = ''
} = {}) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const offset = (p - 1) * l;

  try {
    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (jobType && jobType !== 'all') {
      params.push(jobType);
      conditions.push(`job_type = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await pool.query(
      `SELECT COUNT(*)::int AS total FROM failed_jobs ${whereClause}`,
      params
    );
    const total = countRes.rows[0]?.total || 0;

    const dataParams = [...params, l, offset];
    const dataRes = await pool.query(`
      SELECT 
        id, job_type, payload, error_message, error_stack, retry_count, max_retries, status, user_id, created_at, updated_at
      FROM failed_jobs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}
    `, dataParams);

    return {
      jobs: dataRes.rows,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l) || 1
    };
  } catch (err) {
    console.warn(`⚠️ [DLQ] Failed to fetch jobs from DB (${err.message}). Returning memory fallback.`);
    // Fallback to memory
    let filtered = inMemoryDLQ;
    if (status && status !== 'all') {
      filtered = filtered.filter(j => j.status === status);
    }
    if (jobType && jobType !== 'all') {
      filtered = filtered.filter(j => j.job_type === jobType);
    }

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + l);
    return {
      jobs: paginated,
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l) || 1
    };
  }
}

/**
 * Get aggregate statistics about the Dead Letter Queue
 */
export async function getDLQStats() {
  try {
    const statusCounts = await pool.query(`
      SELECT 
        COUNT(*)::int AS total,
        COUNT(CASE WHEN status = 'failed' THEN 1 END)::int AS failed,
        COUNT(CASE WHEN status = 'retrying' THEN 1 END)::int AS retrying,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END)::int AS resolved,
        COUNT(CASE WHEN status = 'discarded' THEN 1 END)::int AS discarded
      FROM failed_jobs;
    `);

    const typeCounts = await pool.query(`
      SELECT job_type, COUNT(*)::int AS count
      FROM failed_jobs
      WHERE status = 'failed'
      GROUP BY job_type;
    `);

    const byType = {};
    for (const row of typeCounts.rows) {
      byType[row.job_type] = row.count;
    }

    return {
      ...(statusCounts.rows[0] || { total: 0, failed: 0, retrying: 0, resolved: 0, discarded: 0 }),
      byType
    };
  } catch (err) {
    const failed = inMemoryDLQ.filter(j => j.status === 'failed').length;
    const resolved = inMemoryDLQ.filter(j => j.status === 'resolved').length;
    const discarded = inMemoryDLQ.filter(j => j.status === 'discarded').length;
    const retrying = inMemoryDLQ.filter(j => j.status === 'retrying').length;

    return {
      total: inMemoryDLQ.length,
      failed,
      retrying,
      resolved,
      discarded,
      byType: {}
    };
  }
}

/**
 * Retry a single failed job by its ID
 */
export async function retryFailedJob(jobId) {
  // Check memory first if it's an in-memory job
  if (typeof jobId === 'string' && jobId.startsWith('mem_')) {
    const job = inMemoryDLQ.find(j => j.id === jobId);
    if (!job) throw new Error(`Không tìm thấy công việc ID: ${jobId}`);
    
    return await executeRetry(job, async (status, err) => {
      job.status = status;
      job.updated_at = new Date().toISOString();
      if (err) {
        job.error_message = err.message;
        job.retry_count += 1;
      }
    });
  }

  // Database job
  const jobRes = await pool.query('SELECT * FROM failed_jobs WHERE id = $1', [jobId]);
  if (jobRes.rows.length === 0) {
    throw new Error(`Không tìm thấy công việc ID: ${jobId}`);
  }

  const job = jobRes.rows[0];
  await pool.query("UPDATE failed_jobs SET status = 'retrying', updated_at = NOW() WHERE id = $1", [jobId]);

  return await executeRetry(job, async (status, err) => {
    if (status === 'resolved') {
      await pool.query("UPDATE failed_jobs SET status = 'resolved', updated_at = NOW() WHERE id = $1", [jobId]);
    } else {
      await pool.query(`
        UPDATE failed_jobs 
        SET status = 'failed', 
            retry_count = retry_count + 1, 
            error_message = $2, 
            updated_at = NOW() 
        WHERE id = $1
      `, [jobId, err?.message || 'Thử lại thất bại']);
    }
  });
}

/**
 * Helper to execute retry via registered handler
 */
async function executeRetry(job, updateCallback) {
  const handler = jobHandlers.get(job.job_type);
  if (!handler) {
    const err = new Error(`Chưa có bộ xử lý được đăng ký cho loại công việc: ${job.job_type}`);
    await updateCallback('failed', err);
    throw err;
  }

  try {
    const payload = typeof job.payload === 'string' ? JSON.parse(job.payload) : job.payload;
    const result = await handler(payload);
    await updateCallback('resolved', null);
    console.log(`✅ [DLQ] Job [${job.id}] ${job.job_type} retried and resolved successfully.`);
    return { success: true, result };
  } catch (err) {
    console.error(`❌ [DLQ] Job [${job.id}] ${job.job_type} retry failed: ${err.message}`);
    await updateCallback('failed', err);
    throw err;
  }
}

/**
 * Discard / ignore a failed job
 */
export async function discardFailedJob(jobId) {
  if (typeof jobId === 'string' && jobId.startsWith('mem_')) {
    const job = inMemoryDLQ.find(j => j.id === jobId);
    if (job) {
      job.status = 'discarded';
      job.updated_at = new Date().toISOString();
      return { success: true, discardedId: jobId };
    }
    throw new Error(`Không tìm thấy công việc ID: ${jobId}`);
  }

  const res = await pool.query(`
    UPDATE failed_jobs 
    SET status = 'discarded', updated_at = NOW() 
    WHERE id = $1 
    RETURNING id;
  `, [jobId]);

  if (res.rows.length === 0) {
    throw new Error(`Không tìm thấy công việc ID: ${jobId}`);
  }

  return { success: true, discardedId: jobId };
}

/**
 * Retry all jobs currently in 'failed' status
 */
export async function retryAllFailedJobs() {
  const failedJobs = await pool.query("SELECT id FROM failed_jobs WHERE status = 'failed' ORDER BY created_at ASC LIMIT 50");
  const results = {
    total: failedJobs.rows.length,
    succeeded: 0,
    failed: 0,
    errors: []
  };

  for (const row of failedJobs.rows) {
    try {
      await retryFailedJob(row.id);
      results.succeeded++;
    } catch (err) {
      results.failed++;
      results.errors.push({ id: row.id, error: err.message });
    }
  }

  return results;
}
