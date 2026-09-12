import dotenv from 'dotenv';
import app from './app.js';
import { initDb } from './models/schema.js';
import { ensureAdminFromEnv } from './services/authService.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

async function bootstrap() {
  try {
    // 1. Initialize PostgreSQL connection and run migrations
    await initDb();

    // 2. Bootstrap the configured admin account without storing credentials in source.
    const adminBootstrap = await ensureAdminFromEnv();
    if (adminBootstrap) {
      console.log('[AUTH] Bootstrap admin account ' + (adminBootstrap.created ? 'created' : 'verified') + '.');
    }

    // 3. Start HTTP server
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Quẻ Hôm Nay Backend running at: http://localhost:${PORT}`);
      console.log(`💾 PostgreSQL connected on port: ${process.env.DB_PORT || 5434}`);
      console.log(`📁 Modular architecture: Controller-Service-Route`);
      console.log(`=================================================`);
    });
  } catch (err) {
    console.error('❌ Failed to bootstrap backend server:', err);
    process.exit(1);
  }
}

bootstrap();
