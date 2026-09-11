import * as statsService from '../services/statsService.js';

export async function getStats(req, res, next) {
  try {
    const data = await statsService.getGlobalStats();
    res.json(data);
  } catch (err) {
    next(err);
  }
}
