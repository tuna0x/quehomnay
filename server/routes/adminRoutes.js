import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middlewares/auth.js';
import * as contactAdminController from '../controllers/contactAdminController.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/contact-messages', contactAdminController.listMessages);
router.patch('/contact-messages/:id', contactAdminController.updateMessageStatus);

export default router;