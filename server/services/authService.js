import crypto from 'crypto';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { logActivity } from './activityService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'quehomnay_sacred_secret_jwt_2026_tam_thanh_tat_ung';

/**
 * Check if an email should automatically have admin privileges
 */
async function determineUserRole(client, email) {
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  const normalized = (email || '').trim().toLowerCase();
  if (adminEmails.includes(normalized)) {
    return 'admin';
  }

  // If there are zero registered users in the database, the first user becomes Admin
  const countRes = await client.query("SELECT COUNT(*) FROM users WHERE email IS NOT NULL");
  if (parseInt(countRes.rows[0].count, 10) === 0) {
    return 'admin';
  }

  return 'user';
}

/**
 * Transfer / merge guest draws and quota to authenticated user
 */
async function linkGuestData(client, guestUserId, authUserId) {
  if (!guestUserId || guestUserId === authUserId) return;

  try {
    // Reassign previous draws created by guest to the logged in account
    await client.query(
      'UPDATE draws SET user_id = $1 WHERE user_id = $2',
      [authUserId, guestUserId]
    );

    // Merge extra draws from guest if any
    const guestRes = await client.query('SELECT extra_draws, extra_draws_date FROM users WHERE id = $1', [guestUserId]);
    if (guestRes.rows.length > 0 && guestRes.rows[0].extra_draws > 0) {
      await client.query(`
        UPDATE users 
        SET extra_draws = extra_draws + $1, updated_at = NOW() 
        WHERE id = $2
      `, [guestRes.rows[0].extra_draws, authUserId]);
    }
  } catch (err) {
    console.debug('[AuthService] Error linking guest data:', err.message);
  }
}

/**
 * Register a new user with Email and Password
 */
export async function registerWithEmail({ email, password, name, guestUserId, ip }) {
  if (!email || !password) {
    const error = new Error('Vui lòng nhập đầy đủ Email và Mật khẩu.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    const error = new Error('Địa chỉ email không hợp lệ.');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('Mật khẩu phải có độ dài ít nhất 6 ký tự.');
    error.statusCode = 400;
    throw error;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if email already exists
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      const error = new Error('Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcryptjs.hash(password, 10);
    const userId = `usr_acc_${crypto.randomUUID()}`;
    const displayName = (name || '').trim() || normalizedEmail.split('@')[0];
    const role = await determineUserRole(client, normalizedEmail);

    const insertRes = await client.query(`
      INSERT INTO users (
        id, email, password_hash, name, role, provider, created_at, updated_at, last_login_at
      ) VALUES ($1, $2, $3, $4, $5, 'email', NOW(), NOW(), NOW())
      RETURNING id, email, name, avatar_url, role, provider, created_at
    `, [userId, normalizedEmail, passwordHash, displayName, role]);

    const newUser = insertRes.rows[0];

    // Link previous guest draws
    if (guestUserId) {
      await linkGuestData(client, guestUserId, newUser.id);
    }

    await client.query('COMMIT');

    // Record activity log
    await logActivity({
      userId: newUser.id,
      userEmail: newUser.email,
      userName: newUser.name,
      actionType: 'AUTH_REGISTER',
      details: { provider: 'email', role: newUser.role },
      ip
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '14d' }
    );

    return {
      token,
      user: newUser
    };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Log in an existing user with Email and Password
 */
export async function loginWithEmail({ email, password, guestUserId, ip }) {
  if (!email || !password) {
    const error = new Error('Vui lòng nhập Email và Mật khẩu.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const client = await pool.connect();
  try {
    const userRes = await client.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    if (userRes.rows.length === 0) {
      const error = new Error('Email hoặc mật khẩu không chính xác.');
      error.statusCode = 401;
      throw error;
    }

    const user = userRes.rows[0];

    if (!user.password_hash) {
      const error = new Error('Tài khoản này được đăng ký qua Google. Vui lòng chọn "Đăng nhập bằng Google".');
      error.statusCode = 400;
      throw error;
    }

    const isMatch = await bcryptjs.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Email hoặc mật khẩu không chính xác.');
      error.statusCode = 401;
      throw error;
    }

    // Auto promote to admin if configured in env
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
    let role = user.role;
    if (adminEmails.includes(normalizedEmail) && role !== 'admin') {
      role = 'admin';
      await client.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', user.id]);
    }

    // Update last login
    await client.query('UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1', [user.id]);

    // Link previous guest draws
    if (guestUserId) {
      await linkGuestData(client, guestUserId, user.id);
    }

    // Record activity log
    await logActivity({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      actionType: 'AUTH_LOGIN',
      details: { provider: 'email' },
      ip
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role, name: user.name },
      JWT_SECRET,
      { expiresIn: '14d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        role,
        provider: user.provider
      }
    };
  } finally {
    client.release();
  }
}

/**
 * Log in or Register via Google OAuth ID Token / Profile
 */
export async function loginWithGoogle({ credential, userInfo, guestUserId, ip }) {
  let googleUser = null;

  // 1. If Google ID Token is provided, verify it
  if (credential) {
    try {
      // First try Google tokeninfo endpoint
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (res.ok) {
        const payload = await res.json();
        googleUser = {
          googleId: payload.sub,
          email: payload.email,
          name: payload.name || payload.given_name || 'Đạo Hữu',
          avatarUrl: payload.picture
        };
      }
    } catch (e) {
      console.debug('[AuthService] Google tokeninfo network fetch failed, trying jwt decode fallback:', e.message);
    }

    // Fallback: decode JWT directly
    if (!googleUser) {
      try {
        const decoded = jwt.decode(credential);
        if (decoded && decoded.email) {
          googleUser = {
            googleId: decoded.sub,
            email: decoded.email,
            name: decoded.name || decoded.given_name || 'Đạo Hữu',
            avatarUrl: decoded.picture
          };
        }
      } catch (err) {
        // failed
      }
    }
  }

  // 2. Fallback to userInfo (e.g. dev mock mode or client-provided profile)
  if (!googleUser && userInfo && userInfo.email) {
    googleUser = {
      googleId: userInfo.googleId || userInfo.sub || `g_${Date.now()}`,
      email: userInfo.email,
      name: userInfo.name || 'Đạo Hữu',
      avatarUrl: userInfo.picture || userInfo.avatarUrl || null
    };
  }

  if (!googleUser || !googleUser.email) {
    const error = new Error('Không thể xác thực thông tin tài khoản Google. Vui lòng thử lại.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = googleUser.email.trim().toLowerCase();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if user exists by google_id or by email
    let userRes = await client.query(
      'SELECT * FROM users WHERE google_id = $1 OR email = $2',
      [googleUser.googleId, normalizedEmail]
    );

    let user;
    let isNewUser = false;

    if (userRes.rows.length === 0) {
      // Create new user
      isNewUser = true;
      const role = await determineUserRole(client, normalizedEmail);
      const userId = `usr_acc_${crypto.randomUUID()}`;

      const insertRes = await client.query(`
        INSERT INTO users (
          id, email, name, avatar_url, role, provider, google_id, created_at, updated_at, last_login_at
        ) VALUES ($1, $2, $3, $4, $5, 'google', $6, NOW(), NOW(), NOW())
        RETURNING id, email, name, avatar_url, role, provider
      `, [userId, normalizedEmail, googleUser.name, googleUser.avatarUrl, role, googleUser.googleId]);

      user = insertRes.rows[0];
    } else {
      user = userRes.rows[0];
      // Update Google ID and Avatar if not linked
      const adminEmails = (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);
      let role = user.role;
      if (adminEmails.includes(normalizedEmail)) {
        role = 'admin';
      }

      await client.query(`
        UPDATE users 
        SET google_id = COALESCE(google_id, $1),
            avatar_url = COALESCE($2, avatar_url),
            name = COALESCE($3, name),
            role = $4,
            last_login_at = NOW(),
            updated_at = NOW()
        WHERE id = $5
      `, [googleUser.googleId, googleUser.avatarUrl, googleUser.name, role, user.id]);

      user.role = role;
      user.avatar_url = googleUser.avatarUrl || user.avatar_url;
    }

    // Link previous guest draws
    if (guestUserId) {
      await linkGuestData(client, guestUserId, user.id);
    }

    await client.query('COMMIT');

    // Record activity log
    await logActivity({
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      actionType: isNewUser ? 'AUTH_REGISTER' : 'AUTH_LOGIN',
      details: { provider: 'google', role: user.role },
      ip
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '14d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        role: user.role,
        provider: user.provider || 'google'
      }
    };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get profile for authenticated user
 */
export async function getCurrentUser(userId) {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT u.id, u.email, u.name, u.avatar_url, u.role, u.provider, u.created_at, u.last_login_at,
             u.extra_draws, u.invite_count,
             (SELECT COUNT(*) FROM draws d WHERE d.user_id = u.id) AS total_draws
      FROM users u
      WHERE u.id = $1
    `, [userId]);

    if (res.rows.length === 0) {
      const error = new Error('Tài khoản không tồn tại.');
      error.statusCode = 404;
      throw error;
    }

    const row = res.rows[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatar_url: row.avatar_url,
      role: row.role,
      provider: row.provider,
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at,
      extraDraws: row.extra_draws || 0,
      inviteCount: row.invite_count || 0,
      totalDraws: parseInt(row.total_draws, 10) || 0
    };
  } finally {
    client.release();
  }
}
