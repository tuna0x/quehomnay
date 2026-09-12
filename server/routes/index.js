import { Router } from 'express';
import adminRoutes from './adminRoutes.js';
import healthRoutes from './healthRoutes.js';
import statsRoutes from './statsRoutes.js';
import userRoutes from './userRoutes.js';
import drawRoutes from './drawRoutes.js';
import historyRoutes from './historyRoutes.js';
import fortuneRoutes from './fortuneRoutes.js';
import authRoutes from './authRoutes.js';
import contactRoutes from './contactRoutes.js';
import aiRoutes from './aiRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/stats', statsRoutes);
router.use('/user', userRoutes);
router.use('/draw', drawRoutes);
router.use('/history', historyRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/fortune', fortuneRoutes);
router.use('/ai', aiRoutes);
router.use('/contact', contactRoutes);

export default router;
