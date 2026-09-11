import dotenv from 'dotenv';
import app from './app.js';
import { initDb } from './models/schema.js';
import { initRedis } from './config/redis.js';
import { initQueueService, flushAllOnShutdown } from './services/queueService.js';

dotenv.config();

const PORT = process.env.PORT || 5001;

async function bootstrap() {
  try {
    // 1. Initialize PostgreSQL connection and run migrations
    await initDb();

    // 2. Initialize Redis connection (with automatic fallback to In-Memory if offline)
    await initRedis();

    // 3. Initialize Batch Queue Service for Traffic & Activities
    initQueueService();

    // 4. Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 Quẻ Hôm Nay Backend running at: http://localhost:${PORT}`);
      console.log(`💾 PostgreSQL connected on port: ${process.env.DB_PORT || 5434}`);
      console.log(`⚡ Redis & Batch Queue System Active`);
      console.log(`📁 Modular architecture: Controller-Service-Route`);
      console.log(`=================================================`);
    });

    // Graceful Shutdown: flush pending queue logs to database
    const handleShutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
      await flushAllOnShutdown();
      server.close(() => {
        console.log('✅ Server closed cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (err) {
    console.error('❌ Failed to bootstrap backend server:', err.message);
    console.error('💡 TIP: Đảm bảo PostgreSQL đang chạy. Bạn có thể bật Docker với lệnh:');
    console.error('   npm run docker:up');
    console.error('   hoặc kiểm tra DATABASE_URL trong tệp .env.');
    process.exit(1);
  }
}

bootstrap();
