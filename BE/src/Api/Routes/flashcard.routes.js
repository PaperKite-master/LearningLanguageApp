import { flashcardController } from '../Controllers/flashcard.controller.js';
import { authenticate } from '../Middlewares/authenticate.js';
import { flashcardRepoPlugin } from '../Middlewares/flashcardRepo.middleware.js';
import {
  CreateFlashcardBodySchema,
  ExportQuizletResponseSchema,
  FlashcardIdParamsSchema,
  FlashcardResponseSchema,
  ListFlashcardsResponseSchema,
  UpdateFlashcardBodySchema
} from '../Schemas/flashcard.schemas.js';

export async function flashcardRoutes(app) {
  await app.register(flashcardRepoPlugin);

  // ─── POST /flashcards ──────────────────────────────────────────────────────
  app.post(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Flashcards'],
        summary: 'Create a new flashcard',
        security: [{ bearerAuth: [] }],
        body: CreateFlashcardBodySchema,
        response: {
          201: FlashcardResponseSchema
        }
      }
    },
    flashcardController.create
  );

  // ─── GET /flashcards ───────────────────────────────────────────────────────
  app.get(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Flashcards'],
        summary: 'List all flashcards for the authenticated user',
        security: [{ bearerAuth: [] }],
        response: {
          200: ListFlashcardsResponseSchema
        }
      }
    },
    flashcardController.list
  );

  // ─── GET /flashcards/export/quizlet ───────────────────────────────────────
  // NOTE: This route MUST be declared before /:id so Fastify does not treat
  //       "export" as a UUID parameter.
  app.get(
    '/export/quizlet',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Flashcards'],
        summary: 'Export flashcards as a Quizlet-importable tab-delimited text',
        security: [{ bearerAuth: [] }],
        response: {
          200: ExportQuizletResponseSchema
        }
      }
    },
    flashcardController.exportQuizlet
  );

  // ─── PATCH /flashcards/:id ─────────────────────────────────────────────────
  app.patch(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Flashcards'],
        summary: 'Update a flashcard (owner only)',
        security: [{ bearerAuth: [] }],
        params: FlashcardIdParamsSchema,
        body: UpdateFlashcardBodySchema,
        response: {
          200: FlashcardResponseSchema
        }
      }
    },
    flashcardController.update
  );

  // ─── DELETE /flashcards/:id ────────────────────────────────────────────────
  app.delete(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Flashcards'],
        summary: 'Delete a flashcard (owner only)',
        security: [{ bearerAuth: [] }],
        params: FlashcardIdParamsSchema,
        response: {
          204: {}
        }
      }
    },
    flashcardController.remove
  );
}
