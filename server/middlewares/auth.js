import crypto from 'node:crypto';
import { pool } from '../config/db.js';

export const SESSION_COOKIE = 'qhn_session';
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function readSessionToken(req) {
  const cookies = req.headers.cookie || '';
  const entry = cookies.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (entry) return decodeURIComponent(entry.slice(`${SESSION_COOKIE}=`.length));

  const authorization = req.headers.authorization || '';
  return authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : null;
}

export function setSessionCookie(res, token) {
  const attributes = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE_SECONDS}`
  ];
  if (process.env.NODE_ENV === 'production') attributes.push('Secure');
  res.setHeader('Set-Cookie', attributes.join('; '));
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

export async function optionalAuth(req, res, next) {
  if (!req.path.startsWith('/api')) return next();
  const token = readSessionToken(req);
  req.sessionToken = token;
  req.user = null;

  if (!token) return next();

  try {
    const result = await pool.query(`
      SELECT u.id, u.email, u.name, u.role, u.provider
      FROM auth_sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > NOW() AND u.email IS NOT NULL
    `, [hashToken(token)]);

    if (result.rows[0]) req.user = result.rows[0];
  } catch (error) {
    console.error('[AUTH] Optional session lookup failed:', error.message);
  }

  return next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục.' });
  return next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Bạn không có quyền truy cập khu vực quản trị.' });
  }
  return next();
}
