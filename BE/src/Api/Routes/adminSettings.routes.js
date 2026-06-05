import { authenticate } from '../Middlewares/authenticate.js';
import { requireAdmin } from '../Middlewares/requireAdmin.middleware.js';
import { adminSettingsController } from '../Controllers/adminSettings.controller.js';
import {
  AdminSettingsResponseSchema,
  UpdateAdminSettingsBodySchema,
} from '../Schemas/adminSettings.schemas.js';

export async function adminSettingsRoutes(app) {
  app.get(
    '/',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Settings'],
        summary: 'Get global system settings',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              data: AdminSettingsResponseSchema,
            },
          },
        },
      },
    },
    adminSettingsController.getSettings
  );

  app.put(
    '/',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Settings'],
        summary: 'Update global system settings',
        security: [{ bearerAuth: [] }],
        body: UpdateAdminSettingsBodySchema,
        response: {
          200: {
            type: 'object',
            properties: {
              data: AdminSettingsResponseSchema,
            },
          },
        },
      },
    },
    adminSettingsController.updateSettings
  );
}
