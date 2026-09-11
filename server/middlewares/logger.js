export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.path.startsWith('/api/stats') && !req.path.startsWith('/api/health')) {
      console.log(`[API] ${req.method} ${req.originalUrl || req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
}
