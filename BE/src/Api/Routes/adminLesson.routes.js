import { adminLessonController } from '../Controllers/adminLesson.controller.js';
import { lessonRepoPlugin } from '../Middlewares/lessonRepo.middleware.js';
import { requireAdmin } from '../Middlewares/requireAdmin.middleware.js';
import { AdminHeadersSchema } from '../Schemas/adminAuth.schemas.js';
import {
  CreateLessonBodySchema,
  LessonIdParamsSchema,
  LessonResponseSchema,
  UpdateLessonBodySchema
} from '../Schemas/adminLesson.schemas.js';

export async function adminLessonRoutes(app) {
  await app.register(lessonRepoPlugin);

  app.post(
    '/',
    {
      preHandler: requireAdmin,
      schema: {
        headers: AdminHeadersSchema,
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
      preHandler: requireAdmin,
      schema: {
        headers: AdminHeadersSchema,
        params: LessonIdParamsSchema,
        body: UpdateLessonBodySchema,
        response: {
          200: LessonResponseSchema
        }
      }
    },
    adminLessonController.update
  );
}

