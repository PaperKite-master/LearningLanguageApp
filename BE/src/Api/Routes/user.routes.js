import { userController } from '../Controllers/user.controller.js';
import { authenticate } from '../Middlewares/authenticate.js';
import {
  DashboardResponseSchema,
  StudyTimeBodySchema,
  StudyTimeResponseSchema,
  UserErrorResponseSchema,
  UpdateProfileBodySchema,
  UpdateProfileResponseSchema
} from '../Schemas/user.schemas.js';

export async function userRoutes(app) {
  app.get(
    '/me/dashboard',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Users'],
        summary: 'Dashboard stats for the authenticated user',
        security: [{ bearerAuth: [] }],
        response: {
          200: DashboardResponseSchema,
          401: UserErrorResponseSchema,
          404: UserErrorResponseSchema,
          500: UserErrorResponseSchema,
        },
      },
    },
    userController.dashboard
  );

  app.post(
    '/me/study-time',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Users'],
        summary: 'Add study minutes for the authenticated user',
        security: [{ bearerAuth: [] }],
        body: StudyTimeBodySchema,
        response: {
          200: StudyTimeResponseSchema,
          400: UserErrorResponseSchema,
          401: UserErrorResponseSchema,
          500: UserErrorResponseSchema,
        },
      },
    },
    userController.addStudyTime
  );

  app.patch(
    '/me',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Users'],
        summary: 'Update user profile (e.g. targetLevel, fullName)',
        security: [{ bearerAuth: [] }],
        body: UpdateProfileBodySchema,
        response: {
          200: UpdateProfileResponseSchema,
          400: UserErrorResponseSchema,
          401: UserErrorResponseSchema,
          500: UserErrorResponseSchema,
        },
      },
    },
    userController.updateProfile
  );
}
