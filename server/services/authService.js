import crypto from 'node:crypto';
import { pool } from '../config/db.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const SESSION_TTL_DAYS = Number(process.env.AUTH_SESSION_DAYS || 30);

function authError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function validateEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || normalizedEmail.length > 254 || !EMAIL_PATTERN.test(normalizedEmail)) {
    throw authError('Địa chỉ email không hợp lệ.', 400);
  }
  return normalizedEmail;
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH || password.length > 128) {
    throw authError('Mật khẩu phải có từ 8 đến 128 ký tự.', 400);
  }
}

function derivePassword(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await derivePassword(password, salt);
  return 'scrypt$' + salt + '$' + derivedKey.toString('hex');
}

async function verifyPassword(password, storedHash) {
  const parts = typeof storedHash === 'string' ? storedHash.split('$') : [];
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;

  const derivedKey = await derivePassword(password, parts[1]);
  const expectedKey = Buffer.from(parts[2], 'hex');
  return expectedKey.length === derivedKey.length && crypto.timingSafeEqual(expectedKey, derivedKey);
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    provider: row.provider,
    role: row.role || 'user',
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at
  };
}

async function linkGuestData(client, guestUserId, accountUserId) {
  if (typeof guestUserId !== 'string' || !guestUserId || guestUserId === accountUserId || guestUserId.length > 100) {
    return;
  }

  await client.query('UPDATE draws SET user_id = $1 WHERE user_id = $2', [accountUserId, guestUserId]);

  const guestResult = await client.query(
    'SELECT extra_draws, extra_draws_date, last_draw_date FROM users WHERE id = $1',
    [guestUserId]
  );
  const guest = guestResult.rows[0];
  if (!guest) return;

  await client.query(`
    UPDATE users
    SET extra_draws = GREATEST(extra_draws, $1),
        extra_draws_date = CASE
          WHEN extra_draws_date IS NULL OR extra_draws_date < $2 THEN $2
          ELSE extra_draws_date
        END,
        last_draw_date = COALESCE(last_draw_date, $3),
        updated_at = NOW()
    WHERE id = $4
  `, [guest.extra_draws || 0, guest.extra_draws_date, guest.last_draw_date, accountUserId]);
}

async function createSession(client, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  await client.query(`
    INSERT INTO auth_sessions (token_hash, user_id, expires_at)
    VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 day'))
  `, [hashToken(token), userId, SESSION_TTL_DAYS]);
  return token;
}

function getIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || req.ip || 'unknown';
}

export async function provisionAdminAccount({ email, password, name }) {
  const normalizedEmail = validateEmail(email);
  validatePassword(password);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existingResult = await client.query(
      'SELECT * FROM users WHERE email = $1 FOR UPDATE',
      [normalizedEmail]
    );
    const existingUser = existingResult.rows[0];
    const displayName = (typeof name === 'string' ? name.trim() : '').slice(0, 255)
      || existingUser?.name
      || normalizedEmail.split('@')[0];

    let user;
    let created = false;

    if (existingUser) {
      const passwordHash = existingUser.password_hash || await hashPassword(password);
      const result = await client.query(
        "UPDATE users SET password_hash = COALESCE(password_hash, $1), name = COALESCE(NULLIF($2, ''), name), role = 'admin', updated_at = NOW() WHERE id = $3 RETURNING *",
        [passwordHash, displayName, existingUser.id]
      );
      user = result.rows[0];
    } else {
      const passwordHash = await hashPassword(password);
      const userId = 'usr_admin_' + crypto.randomUUID();
      const result = await client.query(
        "INSERT INTO users (id, email, name, password_hash, role, provider) VALUES ($1, $2, $3, $4, 'admin', 'email') RETURNING *",
        [userId, normalizedEmail, displayName, passwordHash]
      );
      user = result.rows[0];
      created = true;
    }

    await client.query('COMMIT');
    return { created, user: publicUser(user) };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function ensureAdminFromEnv() {
  const email = typeof process.env.ADMIN_EMAIL === 'string'
    ? process.env.ADMIN_EMAIL.trim()
    : '';
  const password = process.env.ADMIN_PASSWORD;

  if (!email && !password) return null;
  if (!email || typeof password !== 'string' || !password) {
    throw authError('Cần cấu hình đồng thời ADMIN_EMAIL và ADMIN_PASSWORD để tạo admin.', 500);
  }

  return provisionAdminAccount({
    email,
    password,
    name: process.env.ADMIN_NAME || 'Quản trị viên'
  });
}
export async function registerWithPassword({ email, password, name, guestUserId }) {
  const normalizedEmail = validateEmail(email);
  validatePassword(password);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existingResult = await client.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    let user = existingResult.rows[0];
    const passwordHash = await hashPassword(password);
    const displayName = (typeof name === 'string' ? name.trim() : '').slice(0, 255) || normalizedEmail.split('@')[0];

    if (user?.password_hash || user?.google_id) {
      throw authError('Email này đã được đăng ký. Vui lòng đăng nhập bằng phương thức tương ứng.', 409);
    }

    if (user) {
      const result = await client.query(`
        UPDATE users
        SET password_hash = $1, name = $2, provider = 'email', last_login_at = NOW(), updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `, [passwordHash, displayName, user.id]);
      user = result.rows[0];
    } else {
      const userId = 'usr_acc_' + crypto.randomUUID();
      const result = await client.query(`
        INSERT INTO users (id, email, name, password_hash, role, provider, last_login_at)
        VALUES ($1, $2, $3, $4, 'user', 'email', NOW())
        RETURNING *
      `, [userId, normalizedEmail, displayName, passwordHash]);
      user = result.rows[0];
    }

    await linkGuestData(client, guestUserId, user.id);
    const sessionToken = await createSession(client, user.id);
    await client.query('COMMIT');

    return { sessionToken, user: publicUser(user) };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function loginWithPassword({ email, password, guestUserId }) {
  const normalizedEmail = validateEmail(email);
  if (typeof password !== 'string' || !password) {
    throw authError('Vui lòng nhập email và mật khẩu.', 400);
  }

  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    const user = result.rows[0];

    if (!user || !user.password_hash) {
      if (user?.google_id) {
        throw authError('Email này đang dùng đăng nhập Google. Vui lòng chọn Google.', 401);
      }
      throw authError('Email hoặc mật khẩu không chính xác.', 401);
    }

    if (!(await verifyPassword(password, user.password_hash))) {
      throw authError('Email hoặc mật khẩu không chính xác.', 401);
    }

    await client.query('BEGIN');
    const updatedResult = await client.query(`
      UPDATE users
      SET last_login_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [user.id]);
    const updatedUser = updatedResult.rows[0];

    await linkGuestData(client, guestUserId, updatedUser.id);
    const sessionToken = await createSession(client, updatedUser.id);
    await client.query('COMMIT');

    return { sessionToken, user: publicUser(updatedUser) };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function verifyGoogleCredential(credential) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw authError('Google login chưa được cấu hình trên server.', 503);
  if (typeof credential !== 'string' || credential.length < 20 || credential.length > 10000) {
    throw authError('Thông tin Google không hợp lệ.', 400);
  }

  let response;
  try {
    response = await fetch(
      'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential),
      { signal: AbortSignal.timeout(5000) }
    );
  } catch {
    throw authError('Không thể xác thực Google lúc này. Vui lòng thử lại.', 503);
  }

  if (!response.ok) throw authError('Phiên Google không hợp lệ.', 401);
  const payload = await response.json();

  if (payload.aud !== clientId || payload.email_verified !== 'true' || !payload.email || !payload.sub) {
    throw authError('Tài khoản Google chưa được xác thực hợp lệ.', 401);
  }

  return {
    googleId: payload.sub,
    email: validateEmail(payload.email),
    name: (payload.name || payload.email.split('@')[0]).slice(0, 255)
  };
}

export async function loginWithGoogle({ credential, guestUserId }) {
  const googleUser = await verifyGoogleCredential(credential);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const existingResult = await client.query(
      'SELECT * FROM users WHERE google_id = $1 OR email = $2',
      [googleUser.googleId, googleUser.email]
    );
    let user = existingResult.rows[0];

    if (user) {
      const result = await client.query(`
        UPDATE users
        SET google_id = COALESCE(google_id, $1),
            name = COALESCE(NULLIF($2, ''), name),
            provider = CASE WHEN password_hash IS NULL THEN 'google' ELSE provider END,
            last_login_at = NOW(),
            updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `, [googleUser.googleId, googleUser.name, user.id]);
      user = result.rows[0];
    } else {
      const userId = 'usr_acc_' + crypto.randomUUID();
      const result = await client.query(`
        INSERT INTO users (id, email, name, role, provider, google_id, last_login_at)
        VALUES ($1, $2, $3, 'user', 'google', $4, NOW())
        RETURNING *
      `, [userId, googleUser.email, googleUser.name, googleUser.googleId]);
      user = result.rows[0];
    }

    await linkGuestData(client, guestUserId, user.id);
    const sessionToken = await createSession(client, user.id);
    await client.query('COMMIT');

    return { sessionToken, user: publicUser(user) };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function getCurrentUser(userId) {
  const result = await pool.query(`
    SELECT id, email, name, provider, role, created_at, last_login_at
    FROM users
    WHERE id = $1 AND email IS NOT NULL
  `, [userId]);
  if (!result.rows[0]) throw authError('Tài khoản không tồn tại.', 404);
  return publicUser(result.rows[0]);
}

export async function deleteSession(sessionToken) {
  if (!sessionToken) return;
  await pool.query('DELETE FROM auth_sessions WHERE token_hash = $1', [hashToken(sessionToken)]);
}

export function getRequestIp(req) {
  return getIp(req);
}