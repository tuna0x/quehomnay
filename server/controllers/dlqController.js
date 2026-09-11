import * as dlqService from '../services/dlqService.js';
import { getDrawQueueStatus } from '../services/drawQueueService.js';
import { getAiQueueStatus } from '../services/aiQueueService.js';
import { isRedisAvailable } from '../config/redis.js';

export async function getJobs(req, res, next) {
  try {
    const { page = 1, limit = 20, status = '', jobType = '' } = req.query;
    const result = await dlqService.getFailedJobs({ page, limit, status, jobType });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getStats(req, res, next) {
  try {
    const dlqStats = await dlqService.getDLQStats();
    const drawQueue = getDrawQueueStatus();
    const aiQueue = getAiQueueStatus();
    const redisOnline = isRedisAvailable();

    res.json({
      dlq: dlqStats,
      drawQueue,
      aiQueue,
      redisOnline
    });
  } catch (err) {
    next(err);
  }
}

export async function retryJob(req, res, next) {
  try {
    const { id } = req.params;
    const result = await dlqService.retryFailedJob(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function discardJob(req, res, next) {
  try {
    const { id } = req.params;
    const result = await dlqService.discardFailedJob(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function retryAll(req, res, next) {
  try {
    const result = await dlqService.retryAllFailedJobs();
    res.json(result);
  } catch (err) {
    next(err);
  }
}
