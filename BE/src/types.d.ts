import '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: import('@prisma/client').PrismaClient;
  }

  interface FastifyRequest {
    lessonRepo?: {
      list: () => Promise<Array<any>>;
    };
  }
}

