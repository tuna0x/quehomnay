import * as drawService from '../services/drawService.js';

export async function createDraw(req, res, next) {
  try {
    const { userId: requestedUserId, name, birthYear, question, topic, fortune } = req.body;
    const userId = req.user?.id || requestedUserId;
    if (!userId || !fortune || !fortune.ten_que) {
      return res.status(400).json({ error: 'Missing required parameters (userId, fortune)' });
    }

    const result = await drawService.processFortuneDraw({ userId, name, birthYear, question, topic, fortune });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req, res, next) {
  try {
    const { userId: requestedUserId, limit } = req.query;
    const userId = req.user?.id || requestedUserId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const history = await drawService.getUserHistory(userId, limit);
    res.json({ history });
  } catch (err) {
    next(err);
  }
}

export async function clearHistory(req, res, next) {
  try {
    const requestedUserId = req.query.userId || req.body.userId;
    const userId = req.user?.id || requestedUserId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const result = await drawService.clearUserHistory(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getFortuneById(req, res, next) {
  try {
    const { id } = req.params;
    const fortune = await drawService.getFortuneById(id);
    if (!fortune) {
      return res.status(404).json({ error: 'Fortune not found' });
    }
    res.json({ fortune });
  } catch (err) {
    next(err);
  }
}
