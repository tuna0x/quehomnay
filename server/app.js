import express from 'express';
import cors from 'cors';
import { requestLogger } from './middlewares/logger.js';
import { trafficLogger } from './middlewares/trafficLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import apiRouter from './routes/index.js';

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(trafficLogger);

// API Base Routes
app.use('/api', apiRouter);

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
