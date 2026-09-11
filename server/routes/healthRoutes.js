import { Router } from 'express';
import { pool } from '../config/db.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const dbRes = await pool.query('SELECT NOW() as time;');
    res.json({
      status: 'healthy',
      service: 'quehomnay-backend',
      database: 'postgresql',
      timestamp: dbRes.rows[0].time
    });
  } catch (err) {
    next(err);
  }
});

export default router;
