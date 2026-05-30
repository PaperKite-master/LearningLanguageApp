import { createGrammarUseCase } from '../../Application/UseCases/createGrammar.usecase.js';
import { updateGrammarUseCase } from '../../Application/UseCases/updateGrammar.usecase.js';
import { deleteGrammarUseCase } from '../../Application/UseCases/deleteGrammar.usecase.js';
import { listAdminGrammarsUseCase } from '../../Application/UseCases/listAdminGrammars.usecase.js';

export const adminGrammarController = {
  list: async (request, reply) => {
    const grammars = await listAdminGrammarsUseCase({ grammarRepo: request.grammarRepo });
    return reply.send({ data: grammars });
  },

  create: async (request, reply) => {
    try {
      const grammar = await createGrammarUseCase({
        grammarRepo: request.grammarRepo,
        payload: request.body
      });
      return reply.code(201).send({ data: grammar });
    } catch (err) {
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request body' });
      }
      throw err;
    }
  },

  update: async (request, reply) => {
    try {
      const grammar = await updateGrammarUseCase({
        grammarRepo: request.grammarRepo,
        id: request.params.id,
        payload: request.body
      });
      return reply.send({ data: grammar });
    } catch (err) {
      if (err?.code === 'P2025') {
        return reply.code(404).send({ error: 'Grammar not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request body' });
      }
      throw err;
    }
  },

  remove: async (request, reply) => {
    try {
      await deleteGrammarUseCase({ grammarRepo: request.grammarRepo, id: request.params.id });
      return reply.code(204).send();
    } catch (err) {
      if (err?.code === 'P2025') {
        return reply.code(404).send({ error: 'Grammar not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request params' });
      }
      throw err;
    }
  }
};

