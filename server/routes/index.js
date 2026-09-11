import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import statsRoutes from './statsRoutes.js';
import userRoutes from './userRoutes.js';
import drawRoutes from './drawRoutes.js';
import historyRoutes from './historyRoutes.js';
import fortuneRoutes from './fortuneRoutes.js';
import aiRoutes from './aiRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/stats', statsRoutes);
router.use('/user', userRoutes);
router.use('/draw', drawRoutes);
router.use('/history', historyRoutes);
router.use('/fortune', fortuneRoutes);
router.use('/ai', aiRoutes);

export default router;
