import { createFlashcardUseCase } from '../../Application/UseCases/flashcard/createFlashcard.usecase.js';
import { listFlashcardsUseCase } from '../../Application/UseCases/flashcard/listFlashcards.usecase.js';
import { updateFlashcardUseCase } from '../../Application/UseCases/flashcard/updateFlashcard.usecase.js';
import { deleteFlashcardUseCase } from '../../Application/UseCases/flashcard/deleteFlashcard.usecase.js';
import { exportToQuizletUseCase } from '../../Application/UseCases/flashcard/exportToQuizlet.usecase.js';

export const flashcardController = {
  /**
   * POST /flashcards
   * Create a new flashcard for the authenticated user.
   */
  create: async (request, reply) => {
    try {
      const userId = request.user.sub;
      const flashcard = await createFlashcardUseCase({
        flashcardRepo: request.flashcardRepo,
        userId,
        payload: request.body
      });
      return reply.code(201).send({ data: flashcard });
    } catch (err) {
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format' });
      }
      throw err;
    }
  },

  /**
   * GET /flashcards
   * List all flashcards for the authenticated user.
   */
  list: async (request, reply) => {
    const userId = request.user.sub;
    const flashcards = await listFlashcardsUseCase({
      flashcardRepo: request.flashcardRepo,
      userId
    });
    return reply.send({ data: flashcards });
  },

  /**
   * PATCH /flashcards/:id
   * Update a specific flashcard (only if it belongs to the authenticated user).
   */
  update: async (request, reply) => {
    try {
      const userId = request.user.sub;
      const flashcard = await updateFlashcardUseCase({
        flashcardRepo: request.flashcardRepo,
        id: request.params.id,
        userId,
        payload: request.body
      });
      return reply.send({ data: flashcard });
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
   * DELETE /flashcards/:id
   * Delete a specific flashcard (only if it belongs to the authenticated user).
   */
  remove: async (request, reply) => {
    try {
      const userId = request.user.sub;
      await deleteFlashcardUseCase({
        flashcardRepo: request.flashcardRepo,
        id: request.params.id,
        userId
      });
      return reply.code(204).send();
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
   * GET /flashcards/export/quizlet
   * Export all flashcards as a Quizlet-compatible tab-delimited string.
   */
  exportQuizlet: async (request, reply) => {
    const userId = request.user.sub;
    const text = await exportToQuizletUseCase({
      flashcardRepo: request.flashcardRepo,
      userId
    });
    return reply.send({ data: text });
  }
};
