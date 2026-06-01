import { adminLessonController } from '../Controllers/adminLesson.controller.js';
import { authenticate } from '../Middlewares/authenticate.js';
import { lessonRepoPlugin } from '../Middlewares/lessonRepo.middleware.js';
import { requireAdmin } from '../Middlewares/requireAdmin.middleware.js';
import {
  CreateLessonBodySchema,
  LessonIdParamsSchema,
  LessonResponseSchema,
  UpdateLessonBodySchema,
  ListAdminLessonsResponseSchema
} from '../Schemas/adminLesson.schemas.js';

export async function adminLessonRoutes(app) {
  await app.register(lessonRepoPlugin);

  app.get(
    '/',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        security: [{ bearerAuth: [] }],
        response: {
          200: ListAdminLessonsResponseSchema
        }
      }
    },
    adminLessonController.list
  );

  app.post(
    '/',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        security: [{ bearerAuth: [] }],
        body: CreateLessonBodySchema,
        response: {
          201: LessonResponseSchema
        }
      }
    },
    adminLessonController.create
  );

  app.patch(
    '/:id',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        security: [{ bearerAuth: [] }],
        params: LessonIdParamsSchema,
        body: UpdateLessonBodySchema,
        response: {
          200: LessonResponseSchema
        }
      }
    },
    adminLessonController.update
  );

  app.delete(
    '/:id',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        security: [{ bearerAuth: [] }],
        params: LessonIdParamsSchema,
        response: {
          204: {}
        }
      }
    },
    adminLessonController.remove
  );
}

