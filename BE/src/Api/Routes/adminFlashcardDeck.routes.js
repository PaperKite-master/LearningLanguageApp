import { adminFlashcardDeckController } from '../Controllers/adminFlashcardDeck.controller.js';
import { authenticate } from '../Middlewares/authenticate.js';
import { requireAdmin } from '../Middlewares/requireAdmin.middleware.js';
import { adminFlashcardDeckRepoPlugin } from '../Middlewares/adminFlashcardDeckRepo.middleware.js';
import {
  AdminFlashcardDeckIdParamsSchema,
  AdminFlashcardDeckResponseSchema,
  CreateAdminFlashcardDeckBodySchema,
  DeleteAdminFlashcardDeckResponseSchema,
  ListAdminFlashcardDecksQuerySchema,
  ListAdminFlashcardDecksResponseSchema,
  UpdateAdminFlashcardDeckBodySchema
} from '../Schemas/adminFlashcardDeck.schemas.js';

export default async function adminFlashcardDeckRoutes(app, options) {
  await app.register(adminFlashcardDeckRepoPlugin);

  app.get('/', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      tags: ['Admin Flashcard Decks'],
      summary: 'List all admin flashcard decks',
      security: [{ bearerAuth: [] }],
      querystring: ListAdminFlashcardDecksQuerySchema,
      response: { 200: ListAdminFlashcardDecksResponseSchema }
    }
  }, adminFlashcardDeckController.list);

  app.get('/:id', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      tags: ['Admin Flashcard Decks'],
      summary: 'Get an admin flashcard deck by ID',
      security: [{ bearerAuth: [] }],
      params: AdminFlashcardDeckIdParamsSchema,
      response: { 200: AdminFlashcardDeckResponseSchema }
    }
  }, adminFlashcardDeckController.getOne);

  app.post('/', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      tags: ['Admin Flashcard Decks'],
      summary: 'Create a new admin flashcard deck',
      security: [{ bearerAuth: [] }],
      body: CreateAdminFlashcardDeckBodySchema,
      response: { 201: AdminFlashcardDeckResponseSchema }
    }
  }, adminFlashcardDeckController.create);

  app.patch('/:id', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      tags: ['Admin Flashcard Decks'],
      summary: 'Update an admin flashcard deck',
      security: [{ bearerAuth: [] }],
      params: AdminFlashcardDeckIdParamsSchema,
      body: UpdateAdminFlashcardDeckBodySchema,
      response: { 200: AdminFlashcardDeckResponseSchema }
    }
  }, adminFlashcardDeckController.update);

  app.delete('/:id', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      tags: ['Admin Flashcard Decks'],
      summary: 'Delete an admin flashcard deck',
      security: [{ bearerAuth: [] }],
      params: AdminFlashcardDeckIdParamsSchema,
      response: { 200: DeleteAdminFlashcardDeckResponseSchema }
    }
  }, adminFlashcardDeckController.remove);
}
