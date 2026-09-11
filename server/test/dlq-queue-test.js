import { pushToDLQ, getFailedJobs, getDLQStats, retryFailedJob, discardFailedJob, registerJobHandler } from '../services/dlqService.js';
import { enqueueDraw, getDrawQueueStatus } from '../services/drawQueueService.js';
import { enqueueAiFortune, getAiQueueStatus } from '../services/aiQueueService.js';
import { pool } from '../config/db.js';

async function runQueueAndDLQTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING DLQ & CONCURRENCY QUEUE INTEGRATION TESTS');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // --- TEST 1: DLQ Push & Retrieve ---
  console.log('📌 Test 1: DLQ Push & Retrieval...');
  try {
    const testError = new Error('Test DB connection timeout simulated');
    const dlqJob = await pushToDLQ({
      jobType: 'DRAW_FORTUNE',
      payload: { userId: 'test_user_dlq', question: 'Tình duyên tháng này' },
      error: testError,
      userId: 'test_user_dlq'
    });

    assert(dlqJob && dlqJob.id, 'DLQ job created with valid ID');
    assert(dlqJob.job_type === 'DRAW_FORTUNE', 'DLQ job has correct job_type');
    assert(dlqJob.status === 'failed', 'DLQ job initial status is "failed"');

    const jobsResult = await getFailedJobs({ status: 'failed', jobType: 'DRAW_FORTUNE' });
    const found = jobsResult.jobs.some(j => j.id == dlqJob.id || (j.payload && j.payload.userId === 'test_user_dlq'));
    assert(found, 'getFailedJobs retrieves the pushed job');
  } catch (err) {
    console.error('Test 1 error:', err);
    failed++;
  }

  // --- TEST 2: DLQ Retry & Resolve ---
  console.log('\n📌 Test 2: DLQ Retry Handling...');
  try {
    let mockHandlerExecuted = false;
    registerJobHandler('TEST_JOB_TYPE', async (payload) => {
      mockHandlerExecuted = true;
      return { ok: true, received: payload.val };
    });

    const mockJob = await pushToDLQ({
      jobType: 'TEST_JOB_TYPE',
      payload: { val: 42 },
      error: new Error('Simulated transient failure'),
      userId: 'test_retry_user'
    });

    const retryRes = await retryFailedJob(mockJob.id);
    assert(mockHandlerExecuted, 'Registered retry handler was invoked on retryFailedJob');
    assert(retryRes.success === true, 'retryFailedJob returns success: true');

    const stats = await getDLQStats();
    assert(stats && typeof stats.total === 'number', 'getDLQStats returns valid aggregate metrics');
  } catch (err) {
    console.error('Test 2 error:', err);
    failed++;
  }

  // --- TEST 3: DLQ Discard ---
  console.log('\n📌 Test 3: DLQ Discard Job...');
  try {
    const discardTarget = await pushToDLQ({
      jobType: 'DRAW_FORTUNE',
      payload: { userId: 'discard_user' },
      error: new Error('Irrecoverable error'),
      userId: 'discard_user'
    });

    const discardRes = await discardFailedJob(discardTarget.id);
    assert(discardRes.success === true, 'discardFailedJob executed successfully');
  } catch (err) {
    console.error('Test 3 error:', err);
    failed++;
  }

  // --- TEST 4: Draw Mutex Concurrency Lock ---
  console.log('\n📌 Test 4: Draw Queue Mutex Concurrency Lock (Anti-Race Condition)...');
  try {
    const sharedUserId = 'mutex_test_user_' + Date.now();
    const mockFortune = {
      ten_que: 'Thái Bình',
      muc: 'Thượng',
      loi_que: 'Vạn sự hanh thông',
      giai_nghia: 'Mọi việc suôn sẻ',
      loi_khuyen: 'Giữ tâm sáng'
    };

    // Fire 2 concurrent draws simultaneously for the same user
    const p1 = enqueueDraw({ userId: sharedUserId, fortune: mockFortune });
    const p2 = enqueueDraw({ userId: sharedUserId, fortune: mockFortune });

    const results = await Promise.allSettled([p1, p2]);
    const has429 = results.some(r => r.status === 'rejected' && r.reason?.statusCode === 429);
    assert(has429, 'Second concurrent draw was immediately rejected with HTTP 429 Mutex Lock');

    const queueStatus = getDrawQueueStatus();
    assert(queueStatus.totalLocksBlocked >= 1, 'totalLocksBlocked counter incremented accurately');
  } catch (err) {
    console.error('Test 4 error:', err);
    failed++;
  }

  // --- TEST 5: AI Queue Concurrency Limiter ---
  console.log('\n📌 Test 5: AI Queue Status & Concurrency...');
  try {
    const aiStatus = getAiQueueStatus();
    assert(typeof aiStatus.maxConcurrency === 'number' && aiStatus.maxConcurrency === 5, 'AI Queue maxConcurrency set to 5');
    assert(typeof aiStatus.pendingQueueLength === 'number', 'AI pendingQueueLength is accessible');
  } catch (err) {
    console.error('Test 5 error:', err);
    failed++;
  }

  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  try {
    await pool.end();
  } catch (e) {}

  process.exit(failed > 0 ? 1 : 0);
}

runQueueAndDLQTests();
