import { enqueueActivityLog } from './queueService.js';

/**
 * Log user activity events into activity_logs table via Batch Queue
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} [params.userEmail]
 * @param {string} [params.userName]
 * @param {string} params.actionType
 * @param {Object} [params.details]
 * @param {string} [params.ip]
 */
export async function logActivity({ userId, userEmail = null, userName = null, actionType, details = {}, ip = null }) {
  try {
    enqueueActivityLog({
      userId,
      userEmail,
      userName,
      actionType,
      details,
      ip
    });
    return { success: true };
  } catch (err) {
    console.error('[ActivityLog] Failed to enqueue activity:', err.message);
    return { success: false, error: err.message };
  }
}
