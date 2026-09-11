import { pool } from '../config/db.js';
import { getTodayDateStringVN, getTimeUntilMidnightVN } from '../utils/dateHelper.js';

export async function getOrCreateUser(client, userId) {
  let userRes = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
  if (userRes.rows.length === 0) {
    userRes = await client.query(`
      INSERT INTO users (id, last_draw_date, extra_draws, extra_draws_date, invite_count)
      VALUES ($1, NULL, 0, NULL, 0)
      RETURNING *
    `, [userId]);
  }
  return userRes.rows[0];
}

export async function getUserDrawStatus(userId) {
  const client = await pool.connect();
  try {
    const today = getTodayDateStringVN();
    const user = await getOrCreateUser(client, userId);

    let extraDraws = user.extra_draws || 0;
    if (user.extra_draws_date !== today) {
      extraDraws = 0;
      await client.query(
        'UPDATE users SET extra_draws = 0, extra_draws_date = $1, updated_at = NOW() WHERE id = $2',
        [today, userId]
      );
    }

    const freeDrawUsed = user.last_draw_date === today;
    const canDraw = !freeDrawUsed || extraDraws > 0;
    const remainingDraws = (freeDrawUsed ? 0 : 1) + extraDraws;

    let todayFortune = null;
    if (freeDrawUsed) {
      const fortuneRes = await client.query(`
        SELECT * FROM draws 
        WHERE user_id = $1 AND draw_date = $2 
        ORDER BY created_at DESC LIMIT 1
      `, [userId, today]);

      if (fortuneRes.rows.length > 0) {
        const row = fortuneRes.rows[0];
        todayFortune = {
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
          isAI: row.is_ai,
          drawDate: row.draw_date,
          createdAt: row.created_at
        };
      }
    }

    return {
      canDraw,
      freeDrawUsed,
      extraDraws,
      remainingDraws,
      fortune: todayFortune,
      remainingTime: getTimeUntilMidnightVN()
    };
  } finally {
    client.release();
  }
}

export async function grantUserInviteBonus(userId) {
  const client = await pool.connect();
  try {
    const today = getTodayDateStringVN();
    const user = await getOrCreateUser(client, userId);

    let currentExtra = user.extra_draws || 0;
    if (user.extra_draws_date !== today) {
      currentExtra = 0;
    }

    const newExtra = currentExtra + 1;
    const newInvites = (user.invite_count || 0) + 1;

    await client.query(`
      UPDATE users 
      SET extra_draws = $1, extra_draws_date = $2, invite_count = $3, updated_at = NOW() 
      WHERE id = $4
    `, [newExtra, today, newInvites, userId]);

    return {
      success: true,
      extraDraws: newExtra,
      inviteCount: newInvites
    };
  } finally {
    client.release();
  }
}

export async function processReferralClick({ referrerId, visitorId }) {
  if (!referrerId || !visitorId) {
    return { success: false, reason: 'missing_ids' };
  }

  // Cannot refer oneself
  if (referrerId === visitorId) {
    return { success: false, reason: 'self_referral' };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const today = getTodayDateStringVN();

    // Check if referral was already registered today between these two users
    const existingRef = await client.query(`
      SELECT * FROM referrals 
      WHERE referrer_id = $1 AND visitor_id = $2 AND referral_date = $3
    `, [referrerId, visitorId, today]);

    if (existingRef.rows.length > 0) {
      await client.query('COMMIT');
      return { success: true, bonusGranted: false, alreadyCounted: true };
    }

    // Insert new referral click
    await client.query(`
      INSERT INTO referrals (referrer_id, visitor_id, referral_date, created_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (referrer_id, visitor_id, referral_date) DO NOTHING
    `, [referrerId, visitorId, today]);

    // 1. Grant bonus to Referrer (người gửi link)
    const referrer = await getOrCreateUser(client, referrerId);
    let referrerExtra = referrer.extra_draws || 0;
    if (referrer.extra_draws_date !== today) {
      referrerExtra = 0;
    }
    const newReferrerExtra = referrerExtra + 1;
    const newInvites = (referrer.invite_count || 0) + 1;

    await client.query(`
      UPDATE users 
      SET extra_draws = $1, extra_draws_date = $2, invite_count = $3, updated_at = NOW() 
      WHERE id = $4
    `, [newReferrerExtra, today, newInvites, referrerId]);

    // 2. Also grant bonus to Visitor (người bấm link) as a welcome gift
    const visitor = await getOrCreateUser(client, visitorId);
    let visitorExtra = visitor.extra_draws || 0;
    if (visitor.extra_draws_date !== today) {
      visitorExtra = 0;
    }
    const newVisitorExtra = visitorExtra + 1;

    await client.query(`
      UPDATE users 
      SET extra_draws = $1, extra_draws_date = $2, updated_at = NOW() 
      WHERE id = $3
    `, [newVisitorExtra, today, visitorId]);

    await client.query('COMMIT');

    return {
      success: true,
      bonusGranted: true,
      referrerId,
      visitorExtra: newVisitorExtra
    };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function resetUserLimits(userId) {
  await pool.query(`
    UPDATE users 
    SET last_draw_date = NULL, extra_draws = 0, extra_draws_date = NULL, updated_at = NOW() 
    WHERE id = $1
  `, [userId]);

  return { success: true };
}
