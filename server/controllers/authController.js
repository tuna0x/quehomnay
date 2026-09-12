import * as authService from '../services/authService.js';

export async function register(req, res, next) {
  try {
    const { email, password, name, guestUserId } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || req.ip;

    const result = await authService.registerWithEmail({
      email,
      password,
      name,
      guestUserId,
      ip
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, guestUserId } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || req.ip;

    const result = await authService.loginWithEmail({
      email,
      password,
      guestUserId,
      ip
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const { credential, userInfo, guestUserId } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || req.ip;

    const result = await authService.loginWithGoogle({
      credential,
      userInfo,
      guestUserId,
      ip
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const userId = req.user.id;
    const profile = await authService.getCurrentUser(userId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}
