import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { requestLogger } from './middlewares/logger.js';
import { optionalAuth } from './middlewares/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import apiRouter from './routes/index.js';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');
const isProduction = process.env.NODE_ENV === 'production';

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(requestLogger);
app.use(optionalAuth);

// API Base Routes
app.use('/api', apiRouter);

// Liveness probe: does not require the database so the container can report
// that the HTTP process is alive while the readiness endpoint checks Postgres.
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', service: 'quehomnay' });
});

if (isProduction) {
  // The production container serves the Vite build and API from one process.
  app.use(express.static(distPath, { index: 'index.html' }));

  // SPA fallback for client-side routes, while leaving unknown API routes to
  // Express' normal error handling.
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      return next();
    }

    return res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}
// Root Health Ping
app.get('/', (req, res) => {
  res.json({
    name: 'Quẻ Hôm Nay Backend Service',
    status: 'online',
    version: '1.0.0'
  });
});

// Central Error Handling
app.use(errorHandler);

export default app;
