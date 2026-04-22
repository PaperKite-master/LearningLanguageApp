import { adminGrammarController } from '../Controllers/adminGrammar.controller.js';
import { grammarRepoPlugin } from '../Middlewares/grammarRepo.middleware.js';
import { requireAdmin } from '../Middlewares/requireAdmin.middleware.js';
import { AdminHeadersSchema } from '../Schemas/adminAuth.schemas.js';
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
      preHandler: requireAdmin,
      schema: {
        headers: AdminHeadersSchema,
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
      preHandler: requireAdmin,
      schema: {
        headers: AdminHeadersSchema,
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

