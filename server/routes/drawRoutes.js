import { Router } from 'express';
import * as drawController from '../controllers/drawController.js';

const router = Router();

router.post('/', drawController.createDraw);

export default router;
