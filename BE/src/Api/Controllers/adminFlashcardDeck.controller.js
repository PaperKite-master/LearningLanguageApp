import { listAdminFlashcardDecksUseCase } from '../../Application/UseCases/listAdminFlashcardDecks.usecase.js';
import { getAdminFlashcardDeckUseCase } from '../../Application/UseCases/getAdminFlashcardDeck.usecase.js';
import { createAdminFlashcardDeckUseCase } from '../../Application/UseCases/createAdminFlashcardDeck.usecase.js';
import { updateAdminFlashcardDeckUseCase } from '../../Application/UseCases/updateAdminFlashcardDeck.usecase.js';
import { deleteAdminFlashcardDeckUseCase } from '../../Application/UseCases/deleteAdminFlashcardDeck.usecase.js';

export const adminFlashcardDeckController = {
  list: async (request, reply) => {
    const { search, page, limit } = request.query;
    const result = await listAdminFlashcardDecksUseCase({
      adminFlashcardDeckRepo: request.adminFlashcardDeckRepo,
      search,
      page,
      limit
    });
    return reply.send({
      status: 'success',
      data: result.data,
      meta: result.meta
    });
  },

  getOne: async (request, reply) => {
    try {
      const deck = await getAdminFlashcardDeckUseCase({
        adminFlashcardDeckRepo: request.adminFlashcardDeckRepo,
        id: request.params.id
      });
      return reply.send({ status: 'success', data: deck });
    } catch (err) {
      if (err?.statusCode === 404) {
        return reply.code(404).send({ error: 'Deck not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format' });
      }
      throw err;
    }
  },

  create: async (request, reply) => {
    try {
      const deck = await createAdminFlashcardDeckUseCase({
        adminFlashcardDeckRepo: request.adminFlashcardDeckRepo,
        payload: request.body
      });
      return reply.code(201).send({ status: 'success', data: deck });
    } catch (err) {
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request body' });
      }
      throw err;
    }
  },

  update: async (request, reply) => {
    try {
      const deck = await updateAdminFlashcardDeckUseCase({
        adminFlashcardDeckRepo: request.adminFlashcardDeckRepo,
        id: request.params.id,
        payload: request.body
      });
      return reply.send({ status: 'success', data: deck });
    } catch (err) {
      if (err?.code === 'P2025') {
        return reply.code(404).send({ error: 'Deck not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format' });
      }
      throw err;
    }
  },

  remove: async (request, reply) => {
    try {
      await deleteAdminFlashcardDeckUseCase({
        adminFlashcardDeckRepo: request.adminFlashcardDeckRepo,
        id: request.params.id
      });
      return reply.send({ message: 'Deleted successfully' });
    } catch (err) {
      if (err?.code === 'P2025') {
        return reply.code(404).send({ error: 'Deck not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format' });
      }
      throw err;
    }
  }
};
