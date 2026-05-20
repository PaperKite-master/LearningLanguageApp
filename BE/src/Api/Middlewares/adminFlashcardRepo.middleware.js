import fp from 'fastify-plugin';
import { PrismaAdminFlashcardRepository } from '../../Infrastructure/Repositories/PrismaAdminFlashcardRepository.js';

/**
 * Fastify plugin that attaches an AdminFlashcardRepository instance
 * to every incoming request as `request.adminFlashcardRepo`.
 */
export const adminFlashcardRepoPlugin = fp(async (app) => {
  app.addHook('onRequest', async (request) => {
    request.adminFlashcardRepo = new PrismaAdminFlashcardRepository(app.prisma);
  });
});
