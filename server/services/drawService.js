import crypto from 'crypto';
import { pool } from '../config/db.js';
import { getTodayDateStringVN } from '../utils/dateHelper.js';
import { getOrCreateUser } from './userService.js';
import { incrementGlobalDraws } from './statsService.js';

export async function processFortuneDraw({ userId, name, birthYear, question, topic, fortune }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const today = getTodayDateStringVN();
    const user = await getOrCreateUser(client, userId);

    let extraDraws = user.extra_draws || 0;
    if (user.extra_draws_date !== today) {
      extraDraws = 0;
    }

    const freeDrawUsed = user.last_draw_date === today;

    if (!freeDrawUsed) {
      await client.query(`
        UPDATE users 
        SET last_draw_date = $1, extra_draws = $2, extra_draws_date = $1, updated_at = NOW() 
        WHERE id = $3
      `, [today, extraDraws, userId]);
    } else if (extraDraws > 0) {
      await client.query(`
        UPDATE users 
        SET extra_draws = $1, extra_draws_date = $2, updated_at = NOW() 
        WHERE id = $3
      `, [extraDraws - 1, today, userId]);
      extraDraws -= 1;
    } else {
      await client.query('ROLLBACK');
      const err = new Error('Bạn đã hết lượt xin quẻ hôm nay! Hãy mời bạn bè để nhận thêm lượt.');
      err.statusCode = 403;
      throw err;
    }

    const drawId = fortune.id || `drw_${crypto.randomUUID()}`;
    const bYear = birthYear || fortune.birthYear || '';
    const qTopic = topic || fortune.topic || '';
    const cChi = fortune.canChi || '';
    const nMenh = fortune.menh || '';

    const insertRes = await client.query(`
      INSERT INTO draws (
        id, user_id, ten_que, muc, loi_que, giai_nghia, loi_khuyen,
        mau_sac, mau_hex, con_so, gio_cat, user_name, user_question,
        is_ai, draw_date, birth_year, topic, can_chi, menh, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW())
      RETURNING *;
    `, [
      drawId,
      userId,
      fortune.ten_que,
      fortune.muc || 'Trung',
      fortune.loi_que || '',
      fortune.giai_nghia || '',
      fortune.loi_khuyen || '',
      fortune.mau_sac || '',
      fortune.mau_hex || '',
      fortune.con_so || '',
      fortune.gio_cat || '',
      name || fortune.userName || '',
      question || fortune.userQuestion || '',
      !!fortune.isAI,
      today,
      bYear,
      qTopic,
      cChi,
      nMenh
    ]);

    await incrementGlobalDraws(client);

    await client.query('COMMIT');

    const row = insertRes.rows[0];
    const savedFortune = {
      id: row.id,
      ten_que: row.ten_que,
      muc: row.muc,
      loi_que: row.loi_que,
      giai_nghia: row.giai_nghia,
      loi_khuyen: row.loi_khuyen,
      mau_sac: row.mau_sac,
      mau_hex: row.mau_hex,
      con_so: row.con_so,
      gio_cat: row.gio_cat,
      userName: row.user_name,
      userQuestion: row.user_question,
      birthYear: row.birth_year,
      topic: row.topic,
      canChi: row.can_chi,
      menh: row.menh,
      isAI: row.is_ai,
      drawDate: row.draw_date,
      createdAt: row.created_at
    };

    return {
      success: true,
      fortune: savedFortune,
      remainingDraws: extraDraws,
      extraDraws
    };
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function getUserHistory(userId, limit = 50) {
  const historyRes = await pool.query(`
    SELECT * FROM draws 
    WHERE user_id = $1 
    ORDER BY created_at DESC 
    LIMIT $2
  `, [userId, Math.min(Number(limit), 100)]);

  return historyRes.rows.map(row => ({
    id: row.id,
    ten_que: row.ten_que,
    muc: row.muc,
    loi_que: row.loi_que,
    giai_nghia: row.giai_nghia,
    loi_khuyen: row.loi_khuyen,
    mau_sac: row.mau_sac,
    mau_hex: row.mau_hex,
    con_so: row.con_so,
    gio_cat: row.gio_cat,
    userName: row.user_name,
    userQuestion: row.user_question,
    birthYear: row.birth_year,
    topic: row.topic,
    canChi: row.can_chi,
    menh: row.menh,
    isAI: row.is_ai,
    drawDate: row.draw_date,
    createdAt: row.created_at,
    timestamp: new Date(row.created_at).getTime()
  }));
}

export async function clearUserHistory(userId) {
  await pool.query('DELETE FROM draws WHERE user_id = $1', [userId]);
  return { success: true };
}

export async function getFortuneById(id) {
  const fortuneRes = await pool.query('SELECT * FROM draws WHERE id = $1', [id]);
  if (fortuneRes.rows.length === 0) {
    return null;
  }

  const row = fortuneRes.rows[0];
  return {
    id: row.id,
    ten_que: row.ten_que,
    muc: row.muc,
    loi_que: row.loi_que,
    giai_nghia: row.giai_nghia,
    loi_khuyen: row.loi_khuyen,
    mau_sac: row.mau_sac,
    mau_hex: row.mau_hex,
    con_so: row.con_so,
    gio_cat: row.gio_cat,
    userName: row.user_name,
    userQuestion: row.user_question,
    birthYear: row.birth_year,
    topic: row.topic,
    canChi: row.can_chi,
    menh: row.menh,
    isAI: row.is_ai,
    drawDate: row.draw_date,
    createdAt: row.created_at
  };
}
