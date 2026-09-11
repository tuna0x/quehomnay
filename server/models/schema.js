import { pool } from '../config/db.js';

export async function initDb() {
  const client = await pool.connect();
  try {
    console.log('[DB] Connecting to PostgreSQL database...');

    // 1. Users table (tracks per-device / user daily limit and bonus draws)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        last_draw_date VARCHAR(10),
        extra_draws INT DEFAULT 0,
        extra_draws_date VARCHAR(10),
        invite_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 2. Draws table (stores full fortune draw history)
    await client.query(`
      CREATE TABLE IF NOT EXISTS draws (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
        ten_que VARCHAR(255) NOT NULL,
        muc VARCHAR(50) NOT NULL,
        loi_que TEXT NOT NULL,
        giai_nghia TEXT NOT NULL,
        loi_khuyen TEXT NOT NULL,
        mau_sac VARCHAR(100),
        mau_hex VARCHAR(20),
        con_so VARCHAR(50),
        gio_cat VARCHAR(100),
        user_name VARCHAR(255),
        user_question TEXT,
        is_ai BOOLEAN DEFAULT FALSE,
        draw_date VARCHAR(10) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_draws_user_created ON draws(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_draws_date ON draws(draw_date);

      -- Ensure support for birth year, topic, can chi, and menh
      ALTER TABLE draws ADD COLUMN IF NOT EXISTS birth_year VARCHAR(50);
      ALTER TABLE draws ADD COLUMN IF NOT EXISTS topic VARCHAR(100);
      ALTER TABLE draws ADD COLUMN IF NOT EXISTS can_chi VARCHAR(50);
      ALTER TABLE draws ADD COLUMN IF NOT EXISTS menh VARCHAR(100);
    `);

    // 3. Referrals table (tracks clicks on referral links)
    await client.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        referrer_id VARCHAR(100) NOT NULL,
        visitor_id VARCHAR(100) NOT NULL,
        referral_date VARCHAR(10) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT unique_referral_per_day UNIQUE (referrer_id, visitor_id, referral_date)
      );
      CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
    `);

    // 4. Global Stats table (counts all draws across platform)
    await client.query(`
      CREATE TABLE IF NOT EXISTS global_stats (
        key VARCHAR(50) PRIMARY KEY,
        value BIGINT NOT NULL
      );
    `);

    // Seed baseline statistics
    await client.query(`
      INSERT INTO global_stats (key, value) VALUES ('total_draws', 128450)
      ON CONFLICT (key) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO global_stats (key, value) VALUES ('today_draws', 3842)
      ON CONFLICT (key) DO NOTHING;
    `);

    console.log('[DB] PostgreSQL schema successfully initialized!');
  } finally {
    client.release();
  }
}
