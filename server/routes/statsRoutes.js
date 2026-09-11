import { Router } from 'express';
import * as statsController from '../controllers/statsController.js';

const router = Router();

router.get('/', statsController.getStats);
router.post('/track', statsController.trackPageView);

export default router;
