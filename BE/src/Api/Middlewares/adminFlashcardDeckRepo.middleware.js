import fp from 'fastify-plugin';
import { PrismaAdminFlashcardDeckRepository } from '../../Infrastructure/Repositories/PrismaAdminFlashcardDeckRepository.js';

export const adminFlashcardDeckRepoPlugin = fp(async (app) => {
  app.decorateRequest('adminFlashcardDeckRepo', null);

  app.addHook('preHandler', async (request, reply) => {
    request.adminFlashcardDeckRepo = new PrismaAdminFlashcardDeckRepository(app.prisma);
  });
});
