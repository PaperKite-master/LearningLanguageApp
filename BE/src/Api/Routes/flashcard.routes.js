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

  // ─── GET /flashcards/library ───────────────────────────────────────────────
  app.get(
    '/library',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Flashcards'],
        summary: 'List all library (admin) flashcards',
        security: [{ bearerAuth: [] }],
        response: {
          200: ListFlashcardsResponseSchema
        }
      }
    },
    flashcardController.listLibrary
  );

  // ─── GET /flashcards/me/export/quizlet ─────────────────────────────────────
  app.get(
    '/me/export/quizlet',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Flashcards'],
        summary: 'Export user flashcards as a Quizlet-importable tab-delimited text',
        security: [{ bearerAuth: [] }],
        response: {
          200: ExportQuizletResponseSchema
        }
      }
    },
    // We can reuse exportQuizlet since it uses request.user.sub
    flashcardController.exportQuizlet
  );

  // ─── GET /flashcards/me ────────────────────────────────────────────────────
  app.get(
    '/me',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Flashcards'],
        summary: 'List user personal flashcards',
        security: [{ bearerAuth: [] }],
        response: {
          200: ListFlashcardsResponseSchema
        }
      }
    },
    flashcardController.listMyCards
  );

  // ─── POST /flashcards/me ───────────────────────────────────────────────────
  app.post(
    '/me',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Flashcards'],
        summary: 'Create a personal flashcard',
        security: [{ bearerAuth: [] }],
        body: CreateFlashcardBodySchema,
        response: {
          201: FlashcardResponseSchema
        }
      }
    },
    flashcardController.createMyCard
  );

  // ─── POST /flashcards/me/clone/:id ─────────────────────────────────────────
  app.post(
    '/me/clone/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Flashcards'],
        summary: 'Clone a library flashcard to user personal flashcards',
        security: [{ bearerAuth: [] }],
        params: FlashcardIdParamsSchema,
        response: {
          201: FlashcardResponseSchema
        }
      }
    },
    flashcardController.cloneLibraryCard
  );

  // ─── PATCH /flashcards/me/:id ──────────────────────────────────────────────
  app.patch(
    '/me/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Flashcards'],
        summary: 'Update personal flashcard',
        security: [{ bearerAuth: [] }],
        params: FlashcardIdParamsSchema,
        body: UpdateFlashcardBodySchema,
        response: {
          200: FlashcardResponseSchema
        }
      }
    },
    flashcardController.updateMyCard
  );

  // ─── DELETE /flashcards/me/:id ─────────────────────────────────────────────
  app.delete(
    '/me/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Flashcards'],
        summary: 'Delete personal flashcard',
        security: [{ bearerAuth: [] }],
        params: FlashcardIdParamsSchema,
        response: {
          204: {}
        }
      }
    },
    flashcardController.removeMyCard
  );

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

  // Note: /export/quizlet removed because it moved to /me/export/quizlet

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
