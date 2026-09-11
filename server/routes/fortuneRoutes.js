import { Router } from 'express';
import * as drawController from '../controllers/drawController.js';

const router = Router();

router.get('/:id', drawController.getFortuneById);

export default router;
