import { pool } from '../config/db.js';

const EMAIL_PATTERN = /^[^@]+@[^@]+[.][^@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_SUBJECT_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 3000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const contactAttempts = new Map();

function hasHeaderInjection(value) {
  return value.includes(String.fromCharCode(13)) || value.includes(String.fromCharCode(10));
}
function isRateLimited(ip) {
  const now = Date.now();
  const recentAttempts = (contactAttempts.get(ip) || []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );

  if (recentAttempts.length >= RATE_LIMIT_MAX_REQUESTS) {
    contactAttempts.set(ip, recentAttempts);
    return true;
  }

  recentAttempts.push(now);
  contactAttempts.set(ip, recentAttempts);

  if (contactAttempts.size > 1000) {
    for (const [storedIp, timestamps] of contactAttempts) {
      if (!timestamps.some((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS)) {
        contactAttempts.delete(storedIp);
      }
    }
  }

  return false;
}

function validatePayload(body = {}) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (!name || name.length > MAX_NAME_LENGTH) {
    return { error: 'Vui lòng nhập họ tên hợp lệ.' };
  }
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { error: 'Vui lòng nhập email hợp lệ để nhận phản hồi.' };
  }
  if (!subject || subject.length > MAX_SUBJECT_LENGTH) {
    return { error: 'Vui lòng chọn hoặc nhập chủ đề hợp lệ.' };
  }
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return { error: 'Lời nhắn cần có nội dung và không quá 3000 ký tự.' };
  }
  if ([name, email, subject].some(hasHeaderInjection)) {
    return { error: 'Nội dung biểu mẫu không hợp lệ.' };
  }

  return { value: { name, email, subject, message } };
}

export async function submitContact(req, res, next) {
  const { website } = req.body || {};

  // Hidden honeypot: bots get a harmless validation response without storing data.
  if (typeof website === 'string' && website.trim()) {
    return res.status(400).json({ error: 'Nội dung biểu mẫu không hợp lệ.' });
  }

  const validation = validatePayload(req.body);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Bạn đã gửi hơi nhiều lời nhắn. Vui lòng thử lại sau ít phút.' });
  }

  const { name, email, subject, message } = validation.value;

  try {
    const result = await pool.query(
      'INSERT INTO contact_messages (user_id, name, email, subject, message, ip_address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at',
      [req.user?.id || null, name, email, subject, message, ip]
    );

    return res.status(201).json({
      success: true,
      id: result.rows[0].id,
      message: 'Đã ghi nhận lời nhắn. Quản trị viên sẽ xem và phản hồi sớm nhất có thể.'
    });
  } catch (error) {
    return next(error);
  }
}