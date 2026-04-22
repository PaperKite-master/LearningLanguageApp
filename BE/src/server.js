import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { healthRoutes } from './Api/Routes/health.routes.js';
import { lessonRoutes } from './Api/Routes/lesson.routes.js';
import { adminLessonRoutes } from './Api/Routes/adminLesson.routes.js';
import { adminGrammarRoutes } from './Api/Routes/adminGrammar.routes.js';
import { prismaPlugin } from './Infrastructure/Persistence/prisma.plugin.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      transport:
        process.env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined
    }
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'LearningLanguageApp API',
        version: '0.1.0'
      }
    }
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  });

  await app.register(prismaPlugin);

  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(lessonRoutes, { prefix: '/lessons' });
  await app.register(adminLessonRoutes, { prefix: '/admin/lessons' });
  await app.register(adminGrammarRoutes, { prefix: '/admin/grammars' });

  return app;
}

