import { listAdminFlashcardsUseCase } from '../../Application/UseCases/listAdminFlashcards.usecase.js';
import { getAdminFlashcardUseCase } from '../../Application/UseCases/getAdminFlashcard.usecase.js';
import { createAdminFlashcardUseCase } from '../../Application/UseCases/createAdminFlashcard.usecase.js';
import { updateAdminFlashcardUseCase } from '../../Application/UseCases/updateAdminFlashcard.usecase.js';
import { deleteAdminFlashcardUseCase } from '../../Application/UseCases/deleteAdminFlashcard.usecase.js';

export const adminFlashcardController = {
  /**
   * GET /admin/flashcards
   * List all admin flashcards with optional search and pagination.
   */
  list: async (request, reply) => {
    const { search, deckId, page, limit } = request.query;
    const result = await listAdminFlashcardsUseCase({
      adminFlashcardRepo: request.adminFlashcardRepo,
      search,
      deckId,
      page,
      limit
    });
    return reply.send({
      status: 'success',
      data: result.data,
      meta: result.meta
    });
  },

  /**
   * GET /admin/flashcards/:id
   * Get a single admin flashcard by ID (for edit popup).
   */
  getOne: async (request, reply) => {
    try {
      const flashcard = await getAdminFlashcardUseCase({
        adminFlashcardRepo: request.adminFlashcardRepo,
        id: request.params.id
      });
      return reply.send({ status: 'success', data: flashcard });
    } catch (err) {
      if (err?.statusCode === 404) {
        return reply.code(404).send({ error: 'Flashcard not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format' });
      }
      throw err;
    }
  },

  /**
   * POST /admin/flashcards
   * Create a new admin flashcard.
   */
  create: async (request, reply) => {
    try {
      const flashcard = await createAdminFlashcardUseCase({
        adminFlashcardRepo: request.adminFlashcardRepo,
        payload: request.body
      });
      return reply.code(201).send({ status: 'success', data: flashcard });
    } catch (err) {
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request body' });
      }
      throw err;
    }
  },

  /**
   * PUT /admin/flashcards/:id
   * Update an existing admin flashcard.
   */
  update: async (request, reply) => {
    try {
      const flashcard = await updateAdminFlashcardUseCase({
        adminFlashcardRepo: request.adminFlashcardRepo,
        id: request.params.id,
        payload: request.body
      });
      return reply.send({ status: 'success', data: flashcard });
    } catch (err) {
      if (err?.code === 'P2025') {
        return reply.code(404).send({ error: 'Flashcard not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format' });
      }
      throw err;
    }
  },

  /**
   * DELETE /admin/flashcards/:id
   * Hard-delete an admin flashcard.
   */
  remove: async (request, reply) => {
    try {
      await deleteAdminFlashcardUseCase({
        adminFlashcardRepo: request.adminFlashcardRepo,
        id: request.params.id
      });
      return reply.send({ message: 'Deleted successfully' });
    } catch (err) {
      if (err?.code === 'P2025') {
        return reply.code(404).send({ error: 'Flashcard not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format' });
      }
      throw err;
    }
  }
};
