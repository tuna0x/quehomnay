import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'quehomnay_sacred_secret_jwt_2026_tam_thanh_tat_ung';

/**
 * Authenticate JWT Bearer token middleware
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Yêu cầu đăng nhập để tiếp tục.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch latest user info from database to ensure fresh role and active status
    try {
      const userRes = await pool.query('SELECT id, email, name, avatar_url, role, provider FROM users WHERE id = $1', [decoded.id]);
      if (userRes.rows.length > 0) {
        req.user = userRes.rows[0];
        return next();
      } else {
        return res.status(401).json({ error: 'Tài khoản không tồn tại hoặc đã bị xóa.' });
      }
    } catch (dbErr) {
      // If DB is temporarily unreachable in testing/dev, use verified signed token payload
      if (decoded && decoded.id) {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role || 'user'
        };
        return next();
      }
      throw dbErr;
    }
  } catch (err) {
    return res.status(403).json({ error: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.' });
  }
}

/**
 * Optional authentication: if token is present, decode and attach user, else continue as guest
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userRes = await pool.query('SELECT id, email, name, avatar_url, role, provider FROM users WHERE id = $1', [decoded.id]);
    if (userRes.rows.length > 0) {
      req.user = userRes.rows[0];
    }
  } catch (err) {
    // Ignore invalid optional token
    req.user = null;
  }
  next();
}

/**
 * Require Admin role middleware
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Quyền truy cập bị từ chối: Chỉ Quản trị viên (Admin) mới có quyền thực hiện thao tác này.' 
    });
  }
  next();
}
