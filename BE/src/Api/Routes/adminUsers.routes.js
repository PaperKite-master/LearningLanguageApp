import { adminUsersController } from '../Controllers/adminUsers.controller.js';
import { authenticate } from '../Middlewares/authenticate.js';
import { requireAdmin } from '../Middlewares/requireAdmin.middleware.js';
import {
  AdminUserIdParamsSchema,
  AdminUserResponseSchema,
  AdminUsersListResponseSchema,
  DeleteAdminUserResponseSchema,
  UpdateAdminUserRoleBodySchema,
  UpdateAdminUserStatusBodySchema,
  AdminUserProgressDetailsResponseSchema
} from '../Schemas/adminUsers.schemas.js';

/**
 * @param {import('fastify').FastifyInstance} app
 */
export async function adminUsersRoutes(app) {
  app.get(
    '/',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Users'],
        security: [{ bearerAuth: [] }],
        response: {
          200: AdminUsersListResponseSchema
        }
      }
    },
    adminUsersController.list
  );

  app.put(
    '/:id/role',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Users'],
        security: [{ bearerAuth: [] }],
        params: AdminUserIdParamsSchema,
        body: UpdateAdminUserRoleBodySchema,
        response: {
          200: AdminUserResponseSchema
        }
      }
    },
    adminUsersController.updateRole
  );

  app.put(
    '/:id/status',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Users'],
        security: [{ bearerAuth: [] }],
        params: AdminUserIdParamsSchema,
        body: UpdateAdminUserStatusBodySchema,
        response: {
          200: AdminUserResponseSchema
        }
      }
    },
    adminUsersController.updateStatus
  );

  app.delete(
    '/:id',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Users'],
        summary: 'Delete a user permanently',
        security: [{ bearerAuth: [] }],
        params: AdminUserIdParamsSchema,
        response: {
          200: DeleteAdminUserResponseSchema
        }
      }
    },
    adminUsersController.remove
  );

  app.get(
    '/:id/progress-details',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Users'],
        summary: 'Get user progress grouped by timelines (levels)',
        security: [{ bearerAuth: [] }],
        params: AdminUserIdParamsSchema,
        response: {
          200: AdminUserProgressDetailsResponseSchema
        }
      }
    },
    adminUsersController.getProgressDetails
  );
}