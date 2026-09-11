import * as userService from '../services/userService.js';

export async function getUserStatus(req, res, next) {
  try {
    const { userId } = req.query;
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
    const { userId } = req.body;
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
    const { referrerId, visitorId } = req.body;
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
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const result = await userService.resetUserLimits(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
