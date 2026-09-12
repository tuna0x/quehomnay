import * as authService from '../services/authService.js';
import { clearSessionCookie, setSessionCookie } from '../middlewares/auth.js';

export async function register(req, res, next) {
  try {
    const result = await authService.registerWithPassword({
      email: req.body?.email,
      password: req.body?.password,
      name: req.body?.name,
      guestUserId: req.body?.guestUserId
    });
    setSessionCookie(res, result.sessionToken);
    return res.status(201).json({ user: result.user });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.loginWithPassword({
      email: req.body?.email,
      password: req.body?.password,
      guestUserId: req.body?.guestUserId
    });
    setSessionCookie(res, result.sessionToken);
    return res.json({ user: result.user });
  } catch (error) {
    return next(error);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const result = await authService.loginWithGoogle({
      credential: req.body?.credential,
      guestUserId: req.body?.guestUserId
    });
    setSessionCookie(res, result.sessionToken);
    return res.json({ user: result.user });
  } catch (error) {
    return next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Chưa đăng nhập.' });
    const user = await authService.getCurrentUser(req.user.id);
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
}

export async function logout(req, res, next) {
  try {
    await authService.deleteSession(req.sessionToken);
    clearSessionCookie(res);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}