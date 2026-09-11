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

export async function trackUserAction(req, res, next) {
  try {
    const { actionType, details = {} } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || req.ip;
    const userId = req.headers['x-user-id'] || req.body.userId || null;
    const userName = req.body.userName || null;

    if (actionType) {
      const { logActivity } = await import('../services/activityService.js');
      await logActivity({
        userId,
        userName,
        actionType,
        details,
        ip
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
}
