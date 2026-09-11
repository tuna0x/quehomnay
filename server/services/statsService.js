import { pool } from '../config/db.js';

export async function getGlobalStats() {
  const statsRes = await pool.query(`
    SELECT key, value FROM global_stats WHERE key IN ('total_draws', 'today_draws')
  `);
  
  let totalDraws = 128450;
  let todayDraws = 3842;

  statsRes.rows.forEach(row => {
    if (row.key === 'total_draws') totalDraws = Number(row.value);
    if (row.key === 'today_draws') todayDraws = Number(row.value);
  });

  return {
    totalDraws,
    todayDraws,
    activeUsers: 218 + Math.floor(Math.random() * 25)
  };
}

export async function incrementGlobalDraws(client) {
  await client.query(`
    UPDATE global_stats SET value = value + 1 WHERE key IN ('total_draws', 'today_draws');
  `);
}
