import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import * as dlqController from '../controllers/dlqController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

// Protect all admin endpoints with JWT authentication and Admin role requirement
router.use(authenticateToken, requireAdmin);

router.get('/overview', adminController.getOverview);
router.get('/traffic', adminController.getTraffic);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.get('/activities', adminController.getActivities);

// Dead Letter Queue (DLQ) and queue metrics
router.get('/dlq', dlqController.getJobs);
router.get('/dlq/stats', dlqController.getStats);
router.post('/dlq/:id/retry', dlqController.retryJob);
router.delete('/dlq/:id', dlqController.discardJob);
router.post('/dlq/retry-all', dlqController.retryAll);

export default router;
