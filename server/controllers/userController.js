import * as userService from '../services/userService.js';

export async function getUserStatus(req, res, next) {
  try {
    const userId = req.user?.id || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const status = await userService.getUserDrawStatus(userId);
    res.json(status);
  } catch (err) {
    next(err);
  }
}

export async function claimInviteBonus(req, res, next) {
  try {
    const userId = req.user?.id || req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const result = await userService.grantUserInviteBonus(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleReferralClick(req, res, next) {
  try {
    const { referrerId } = req.body;
    const visitorId = req.user?.id || req.body.visitorId;
    if (!referrerId || !visitorId) {
      return res.status(400).json({ error: 'referrerId and visitorId are required' });
    }
    const result = await userService.processReferralClick({ referrerId, visitorId });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function resetDailyLimit(req, res, next) {
  try {
    const userId = req.user?.id || req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const result = await userService.resetUserLimits(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
