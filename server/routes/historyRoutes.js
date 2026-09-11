import { Router } from 'express';
import * as drawController from '../controllers/drawController.js';

const router = Router();

router.get('/', drawController.getHistory);
router.delete('/', drawController.clearHistory);

export default router;
