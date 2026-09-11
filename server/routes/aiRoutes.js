import { Router } from 'express';
import { generateFortuneHandler, chatLunaHandler, getStatusHandler } from '../controllers/aiController.js';

const router = Router();

router.post('/generate', generateFortuneHandler);
router.post('/chat', chatLunaHandler);
router.get('/status', getStatusHandler);

export default router;
