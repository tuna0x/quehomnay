import { Router } from 'express';
import * as userController from '../controllers/userController.js';

const router = Router();

router.get('/status', userController.getUserStatus);
router.post('/invite', userController.claimInviteBonus);
router.post('/referral/click', userController.handleReferralClick);
router.post('/reset', userController.resetDailyLimit);
router.post('/action', userController.trackUserAction);

export default router;
