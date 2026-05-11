import fp from 'fastify-plugin';
import { PrismaTimelineRepository } from '../../Infrastructure/Repositories/PrismaTimelineRepository.js';

export const timelineRepoPlugin = fp(async (app) => {
  app.addHook('onRequest', async (request) => {
    request.timelineRepo = new PrismaTimelineRepository(app.prisma);
  });
});
