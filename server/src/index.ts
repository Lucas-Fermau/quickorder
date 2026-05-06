import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function bootstrap() {
  await connectDB();
  console.log('[quickorder-api] connected to PostgreSQL');

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`[quickorder-api] listening on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`[quickorder-api] received ${signal}, closing...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('[quickorder-api] failed to start:', err);
  process.exit(1);
});
