import fp from 'fastify-plugin';
import { PrismaFlashcardRepository } from '../../Infrastructure/Repositories/PrismaFlashcardRepository.js';

export const flashcardRepoPlugin = fp(async (app) => {
  app.addHook('onRequest', async (request) => {
    request.flashcardRepo = new PrismaFlashcardRepository(app.prisma);
  });
});
