import { lessonController } from '../Controllers/lesson.controller.js';
import { authenticate } from '../Middlewares/authenticate.js';
import {
  LessonProgressBodySchema,
  LessonProgressResponseSchema,
  LessonIdParamsSchema,
  LessonResponseSchema,
  ListLessonsResponseSchema
} from '../Schemas/lesson.schemas.js';
import { lessonRepoPlugin } from '../Middlewares/lessonRepo.middleware.js';

export async function lessonRoutes(app) {
  await app.register(lessonRepoPlugin);

  app.get(
    '/',
    {
      schema: {
        response: {
          200: ListLessonsResponseSchema
        }
      }
    },
    lessonController.list
  );

  app.get(
    '/:id',
    {
      schema: {
        params: LessonIdParamsSchema,
        response: {
          200: LessonResponseSchema
        }
      }
    },
    lessonController.detail
  );

  app.post(
    '/:id/progress',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Lessons'],
        summary: 'Record lesson progress for the authenticated user',
        security: [{ bearerAuth: [] }],
        params: LessonIdParamsSchema,
        body: LessonProgressBodySchema,
        response: {
          200: LessonProgressResponseSchema
        }
      }
    },
    lessonController.progress
  );
}

