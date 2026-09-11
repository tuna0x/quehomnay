import { generateFortuneWithLuna, chatWithLuna } from './aiService.js';
import { pushToDLQ, registerJobHandler } from './dlqService.js';

// Configuration
const MAX_CONCURRENT_AI = 5;
const MAX_QUEUE_SIZE = 100;

// Internal queue and active state
const aiQueue = [];
let activeWorkers = 0;

// Metrics
let totalAiRequests = 0;
let totalAiSuccess = 0;
let totalAiFailures = 0;
let totalAiRetried = 0;

/**
 * Process the next item in the AI request queue
 */
function processNext() {
  if (activeWorkers >= MAX_CONCURRENT_AI || aiQueue.length === 0) {
    return;
  }

  activeWorkers++;
  const job = aiQueue.shift();

  executeAiJob(job).finally(() => {
    activeWorkers--;
    processNext();
  });
}

/**
 * Execute a single AI job with retry and backoff
 */
async function executeAiJob(job) {
  const { type, payload, resolve, reject, attempt = 1, maxAttempts = 3 } = job;

  try {
    let result;
    if (type === 'AI_FORTUNE') {
      result = await generateFortuneWithLuna(payload);
    } else if (type === 'AI_CHAT') {
      result = await chatWithLuna(payload);
    } else {
      throw new Error(`Loại AI không hợp lệ: ${type}`);
    }

    totalAiSuccess++;
    resolve(result);
  } catch (err) {
    console.warn(`⚠️ [AIQueue] Job ${type} attempt ${attempt}/${maxAttempts} failed: ${err.message}`);

    if (attempt < maxAttempts) {
      totalAiRetried++;
      const delay = Math.pow(attempt, 2) * 500;
      await new Promise(r => setTimeout(r, delay));

      // Re-queue with incremented attempt
      job.attempt = attempt + 1;
      return executeAiJob(job);
    }

    // All retries exhausted -> Route to DLQ
    totalAiFailures++;
    await pushToDLQ({
      jobType: 'AI_GENERATION',
      payload: { type, ...payload },
      error: err,
      userId: payload.userId || null,
      retryCount: maxAttempts,
      maxRetries: 3
    });

    reject(err);
  }
}

/**
 * Enqueue an AI Fortune generation request
 */
export function enqueueAiFortune(payload) {
  totalAiRequests++;
  return new Promise((resolve, reject) => {
    if (aiQueue.length >= MAX_QUEUE_SIZE) {
      const err = new Error('Hệ thống luận quẻ AI đang bận tiếp nhận nhiều yêu cầu. Vui lòng thử lại sau giây lát!');
      err.statusCode = 503;
      return reject(err);
    }

    aiQueue.push({
      type: 'AI_FORTUNE',
      payload,
      resolve,
      reject,
      attempt: 1,
      maxAttempts: 3
    });

    processNext();
  });
}

/**
 * Enqueue an AI Chat interaction request
 */
export function enqueueAiChat(payload) {
  totalAiRequests++;
  return new Promise((resolve, reject) => {
    if (aiQueue.length >= MAX_QUEUE_SIZE) {
      const err = new Error('Phòng đàm đạo AI đang quá tải. Vui lòng thử lại sau giây lát!');
      err.statusCode = 503;
      return reject(err);
    }

    aiQueue.push({
      type: 'AI_CHAT',
      payload,
      resolve,
      reject,
      attempt: 1,
      maxAttempts: 3
    });

    processNext();
  });
}

/**
 * Register DLQ retry handler for AI_GENERATION jobs
 */
registerJobHandler('AI_GENERATION', async (payload) => {
  if (payload.type === 'AI_CHAT') {
    return await chatWithLuna(payload);
  }
  return await generateFortuneWithLuna(payload);
});

/**
 * Get current AI queue metrics
 */
export function getAiQueueStatus() {
  return {
    maxConcurrency: MAX_CONCURRENT_AI,
    activeWorkers,
    pendingQueueLength: aiQueue.length,
    totalAiRequests,
    totalAiSuccess,
    totalAiFailures,
    totalAiRetried
  };
}
