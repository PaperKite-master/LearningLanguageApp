import 'dotenv/config';
import { buildApp } from './server.js';

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';

const app = await buildApp();

try {
  await app.listen({ port, host });
  app.log.info({ port, host }, 'Server listening');
} catch (err) {
  app.log.error(err, 'Failed to start server');
  process.exit(1);
}

