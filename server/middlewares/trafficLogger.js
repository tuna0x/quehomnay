import { enqueueTrafficLog } from '../services/queueService.js';

/**
 * Traffic Logger Middleware
 * Logs incoming HTTP requests and response performance via Batch Queue
 */
export function trafficLogger(req, res, next) {
  // Skip non-API static files, internal health check pings, or favicon
  const path = req.originalUrl || req.url;
  if (
    path.startsWith('/@') || 
    path.startsWith('/node_modules') || 
    path.startsWith('/src') || 
    path === '/favicon.ico' ||
    path === '/api/health'
  ) {
    return next();
  }

  const startTime = Date.now();

  res.on('finish', () => {
    try {
      const responseTimeMs = Date.now() - startTime;
      const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || req.ip;
      const userAgent = req.headers['user-agent'] || '';
      const referrer = req.headers['referer'] || req.headers['referrer'] || '';
      const userId = req.user?.id || req.query?.userId || req.headers['x-user-id'] || null;
      const method = req.method;
      const statusCode = res.statusCode;

      enqueueTrafficLog({
        path,
        method,
        ip,
        userAgent,
        referrer,
        userId,
        statusCode,
        responseTimeMs
      });
    } catch (err) {
      console.debug('[TrafficLogger] Error enqueuing traffic log:', err.message);
    }
  });

  next();
}
