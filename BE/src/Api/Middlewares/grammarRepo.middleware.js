import fp from 'fastify-plugin';
import { PrismaGrammarRepository } from '../../Infrastructure/Repositories/PrismaGrammarRepository.js';

export const grammarRepoPlugin = fp(async (app) => {
  app.addHook('onRequest', async (request) => {
    request.grammarRepo = new PrismaGrammarRepository(app.prisma);
  });
});

