import { adminFlashcardController } from '../Controllers/adminFlashcard.controller.js';
import { authenticate } from '../Middlewares/authenticate.js';
import { adminFlashcardRepoPlugin } from '../Middlewares/adminFlashcardRepo.middleware.js';
import { requireAdmin } from '../Middlewares/requireAdmin.middleware.js';
import {
  AdminFlashcardIdParamsSchema,
  AdminFlashcardResponseSchema,
  CreateAdminFlashcardBodySchema,
  DeleteAdminFlashcardResponseSchema,
  ListAdminFlashcardsQuerySchema,
  ListAdminFlashcardsResponseSchema,
  UpdateAdminFlashcardBodySchema
} from '../Schemas/adminFlashcard.schemas.js';

export async function adminFlashcardRoutes(app) {
  await app.register(adminFlashcardRepoPlugin);

  // ─── GET /admin/flashcards ────────────────────────────────────────────────
  app.get(
    '/',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Flashcards'],
        summary: 'List all admin flashcards (with search & pagination)',
        security: [{ bearerAuth: [] }],
        querystring: ListAdminFlashcardsQuerySchema,
        response: {
          200: ListAdminFlashcardsResponseSchema
        }
      }
    },
    adminFlashcardController.list
  );

  // ─── GET /admin/flashcards/:id ────────────────────────────────────────────
  app.get(
    '/:id',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Flashcards'],
        summary: 'Get a single admin flashcard by ID',
        security: [{ bearerAuth: [] }],
        params: AdminFlashcardIdParamsSchema,
        response: {
          200: AdminFlashcardResponseSchema
        }
      }
    },
    adminFlashcardController.getOne
  );

  // ─── POST /admin/flashcards ───────────────────────────────────────────────
  app.post(
    '/',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Flashcards'],
        summary: 'Create a new admin flashcard',
        security: [{ bearerAuth: [] }],
        body: CreateAdminFlashcardBodySchema,
        response: {
          201: AdminFlashcardResponseSchema
        }
      }
    },
    adminFlashcardController.create
  );

  // ─── PUT /admin/flashcards/:id ────────────────────────────────────────────
  app.put(
    '/:id',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Flashcards'],
        summary: 'Update an admin flashcard',
        security: [{ bearerAuth: [] }],
        params: AdminFlashcardIdParamsSchema,
        body: UpdateAdminFlashcardBodySchema,
        response: {
          200: AdminFlashcardResponseSchema
        }
      }
    },
    adminFlashcardController.update
  );

  // ─── DELETE /admin/flashcards/:id ─────────────────────────────────────────
  app.delete(
    '/:id',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Flashcards'],
        summary: 'Delete an admin flashcard',
        security: [{ bearerAuth: [] }],
        params: AdminFlashcardIdParamsSchema,
        response: {
          200: DeleteAdminFlashcardResponseSchema
        }
      }
    },
    adminFlashcardController.remove
  );
}
