import { lessonController } from '../Controllers/lesson.controller.js';
import { ListLessonsResponseSchema } from '../Schemas/lesson.schemas.js';
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
}

