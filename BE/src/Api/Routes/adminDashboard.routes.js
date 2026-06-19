import { authenticate } from '../Middlewares/authenticate.js';
import { requireAdmin } from '../Middlewares/requireAdmin.middleware.js';
import { adminDashboardController } from '../Controllers/adminDashboard.controller.js';
import { AdminDashboardResponseSchema } from '../Schemas/adminDashboard.schemas.js';

export async function adminDashboardRoutes(app) {
  app.get(
    '/',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Dashboard'],
        summary: 'Get dashboard statistics',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              data: AdminDashboardResponseSchema,
            },
          },
        },
      },
    },
    adminDashboardController.getDashboardStats
  );
}
