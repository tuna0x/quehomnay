import { pool } from '../config/db.js';

const CONTACT_STATUSES = new Set(['new', 'read', 'replied', 'archived']);

function parseStatus(value) {
  if (!value || value === 'all') return null;
  return CONTACT_STATUSES.has(value) ? value : undefined;
}

export async function listMessages(req, res, next) {
  const status = parseStatus(req.query.status);
  if (status === undefined) {
    return res.status(400).json({ error: 'Trạng thái lời nhắn không hợp lệ.' });
  }

  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
  const params = [];
  const where = [];

  if (status) {
    params.push(status);
    where.push('status = $' + params.length);
  }

  params.push(limit);
  const limitPlaceholder = '$' + params.length;

  try {
    const query = [
      'SELECT id, user_id AS "userId", name, email, subject, message, status,',
      'created_at AS "createdAt", updated_at AS "updatedAt"',
      'FROM contact_messages',
      where.length ? 'WHERE ' + where.join(' AND ') : '',
      'ORDER BY created_at DESC',
      'LIMIT ' + limitPlaceholder
    ].filter(Boolean).join(' ');

    const result = await pool.query(query, params);
    return res.json({ messages: result.rows });
  } catch (error) {
    return next(error);
  }
}

export async function updateMessageStatus(req, res, next) {
  const messageId = Number.parseInt(req.params.id, 10);
  const { status } = req.body || {};

  if (!Number.isInteger(messageId) || messageId < 1) {
    return res.status(400).json({ error: 'Mã lời nhắn không hợp lệ.' });
  }
  if (!CONTACT_STATUSES.has(status)) {
    return res.status(400).json({ error: 'Trạng thái lời nhắn không hợp lệ.' });
  }

  try {
    const result = await pool.query(
      'UPDATE contact_messages SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, status, updated_at AS "updatedAt"',
      [status, messageId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Không tìm thấy lời nhắn.' });
    }

    return res.json({ message: result.rows[0] });
  } catch (error) {
    return next(error);
  }
}