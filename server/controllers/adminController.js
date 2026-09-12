import * as adminService from '../services/adminService.js';

export async function getOverview(req, res, next) {
  try {
    const stats = await adminService.getOverviewStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function getTraffic(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const path = req.query.path || '';

    const data = await adminService.getTrafficLogs({ page, limit, path });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || '';
    const role = req.query.role || '';

    const data = await adminService.getUsersList({ page, limit, search, role });
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || req.ip;

    const result = await adminService.updateUserRole({
      targetUserId: id,
      newRole: role,
      adminUser: req.user,
      ip
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getActivities(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const actionType = req.query.actionType || '';
    const search = req.query.search || '';

    const data = await adminService.getActivityLogs({ page, limit, actionType, search });
    res.json(data);
  } catch (err) {
    next(err);
  }
}
