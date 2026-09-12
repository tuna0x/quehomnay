import * as statsService from '../services/statsService.js';
import { pool } from '../config/db.js';

export async function getStats(req, res, next) {
  try {
    const data = await statsService.getGlobalStats();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function trackPageView(req, res, next) {
  try {
    const { path, referrer, userId } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || req.ip;
    const userAgent = req.headers['user-agent'] || '';

    if (path) {
      await pool.query(`
        INSERT INTO traffic_logs (path, method, ip, user_agent, referrer, user_id, status_code, response_time_ms, created_at)
        VALUES ($1, 'VIEW', $2, $3, $4, $5, 200, 0, NOW())
      `, [path.substring(0, 255), ip, userAgent, referrer || '', userId || null]);
    }
    res.json({ success: true });
  } catch (err) {
    // Graceful fallback without failing client
    res.json({ success: false });
  }
}

