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

    // Authentication tables. Existing device users remain valid guests.
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(254);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(30) DEFAULT 'device';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;
    `);


    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_sessions (
        token_hash VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_auth_sessions_expiry ON auth_sessions(expires_at);
    `);

    // Contact inbox: public submissions are stored for admin review.
    await client.query(
      "CREATE TABLE IF NOT EXISTS contact_messages (" +
      "id BIGSERIAL PRIMARY KEY, " +
      "user_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL, " +
      "name VARCHAR(100) NOT NULL, " +
      "email VARCHAR(254) NOT NULL, " +
      "subject VARCHAR(120) NOT NULL, " +
      "message TEXT NOT NULL, " +
      "ip_address VARCHAR(100), " +
      "status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')), " +
      "created_at TIMESTAMPTZ DEFAULT NOW(), " +
      "updated_at TIMESTAMPTZ DEFAULT NOW()" +
      "); " +
      "CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created ON contact_messages(status, created_at DESC);"
    );
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
