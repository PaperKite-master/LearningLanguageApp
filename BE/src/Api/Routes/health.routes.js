import { healthController } from '../Controllers/health.controller.js';

export async function healthRoutes(app) {
  app.get('/', healthController.ping);
}

