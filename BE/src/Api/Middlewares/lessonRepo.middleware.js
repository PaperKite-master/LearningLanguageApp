import fp from 'fastify-plugin';
import { PrismaLessonRepository } from '../../Infrastructure/Repositories/PrismaLessonRepository.js';

export const lessonRepoPlugin = fp(async (app) => {
  app.addHook('onRequest', async (request) => {
    request.lessonRepo = new PrismaLessonRepository(app.prisma);
  });
});

