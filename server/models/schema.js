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

    // Ensure user authentication and role fields
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(20) DEFAULT 'device';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
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

    // 4. Traffic Logs table (tracks visits, endpoints, response time, devices)
    await client.query(`
      CREATE TABLE IF NOT EXISTS traffic_logs (
        id BIGSERIAL PRIMARY KEY,
        path VARCHAR(255) NOT NULL,
        method VARCHAR(10) DEFAULT 'GET',
        ip VARCHAR(100),
        user_agent TEXT,
        referrer TEXT,
        user_id VARCHAR(100),
        status_code INT DEFAULT 200,
        response_time_ms INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_traffic_created ON traffic_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_traffic_user ON traffic_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_traffic_path ON traffic_logs(path);
    `);

    // 5. Activity Logs table (tracks user events: registration, login, draws, bonus, role changes)
    await client.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(100),
        user_email VARCHAR(255),
        user_name VARCHAR(255),
        action_type VARCHAR(50) NOT NULL,
        details JSONB DEFAULT '{}'::jsonb,
        ip VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_logs(action_type);
    `);

    // 6. Global Stats table (counts all draws across platform)
    await client.query(`
      CREATE TABLE IF NOT EXISTS global_stats (
        key VARCHAR(50) PRIMARY KEY,
        value BIGINT NOT NULL
      );
    `);

    // 7. Dead Letter Queue (DLQ) table for failed background jobs and draw/AI retries
    await client.query(`
      CREATE TABLE IF NOT EXISTS failed_jobs (
        id BIGSERIAL PRIMARY KEY,
        job_type VARCHAR(50) NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        error_message TEXT NOT NULL,
        error_stack TEXT,
        retry_count INT DEFAULT 0,
        max_retries INT DEFAULT 3,
        status VARCHAR(20) DEFAULT 'failed',
        user_id VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_failed_jobs_status ON failed_jobs(status);
      CREATE INDEX IF NOT EXISTS idx_failed_jobs_type ON failed_jobs(job_type);
      CREATE INDEX IF NOT EXISTS idx_failed_jobs_created ON failed_jobs(created_at DESC);
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

    console.log('[DB] PostgreSQL schema successfully initialized with Auth, Traffic, Activity & DLQ tables!');
  } finally {
    client.release();
  }
}
