import { grammarController } from '../Controllers/grammar.controller.js';
import { lessonRepoPlugin } from '../Middlewares/lessonRepo.middleware.js';
import { grammarRepoPlugin } from '../Middlewares/grammarRepo.middleware.js';
import { GrammarListQuerySchema, GrammarListResponseSchema } from '../Schemas/grammar.schemas.js';

export async function grammarRoutes(app) {
  await app.register(lessonRepoPlugin);
  await app.register(grammarRepoPlugin);

  app.get(
    '/',
    {
      schema: {
        querystring: GrammarListQuerySchema,
        response: {
          200: GrammarListResponseSchema
        }
      }
    },
    grammarController.listByLesson
  );
}
