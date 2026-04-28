import { adminGrammarController } from '../Controllers/adminGrammar.controller.js';
import { authenticate } from '../Middlewares/authenticate.js';
import { grammarRepoPlugin } from '../Middlewares/grammarRepo.middleware.js';
import { requireAdmin } from '../Middlewares/requireAdmin.middleware.js';
import {
  CreateGrammarBodySchema,
  GrammarIdParamsSchema,
  GrammarResponseSchema,
  UpdateGrammarBodySchema
} from '../Schemas/adminGrammar.schemas.js';

export async function adminGrammarRoutes(app) {
  await app.register(grammarRepoPlugin);

  app.post(
    '/',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        security: [{ bearerAuth: [] }],
        body: CreateGrammarBodySchema,
        response: {
          201: GrammarResponseSchema
        }
      }
    },
    adminGrammarController.create
  );

  app.patch(
    '/:id',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        security: [{ bearerAuth: [] }],
        params: GrammarIdParamsSchema,
        body: UpdateGrammarBodySchema,
        response: {
          200: GrammarResponseSchema
        }
      }
    },
    adminGrammarController.update
  );
}

