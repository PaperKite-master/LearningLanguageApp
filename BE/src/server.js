import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { corsOriginDelegate } from './Infrastructure/corsConfig.js';
import { healthRoutes } from './Api/Routes/health.routes.js';
import { lessonRoutes } from './Api/Routes/lesson.routes.js';
import { timelineRoutes } from './Api/Routes/timeline.routes.js';
import { grammarRoutes } from './Api/Routes/grammar.routes.js';
import { adminLessonRoutes } from './Api/Routes/adminLesson.routes.js';
import { adminSettingsRoutes } from './Api/Routes/adminSettings.routes.js';
import { adminTimelineRoutes } from './Api/Routes/adminTimeline.routes.js';
import { adminGrammarRoutes } from './Api/Routes/adminGrammar.routes.js';
import { adminUsersRoutes } from './Api/Routes/adminUsers.routes.js';
import { adminQuizRoutes } from './Api/Routes/adminQuiz.routes.js';
import { authRoutes } from './Api/Routes/auth.routes.js';
import { userRoutes } from './Api/Routes/user.routes.js';
import { flashcardRoutes } from './Api/Routes/flashcard.routes.js';
import { adminFlashcardRoutes } from './Api/Routes/adminFlashcard.routes.js';
import { quizRoutes } from './Api/Routes/quiz.routes.js';
import { notificationRoutes } from './Api/Routes/notification.routes.js';
import { paymentRoutes } from './Api/Routes/payment.routes.js';
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

  await app.register(cors, {
    origin: corsOriginDelegate,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger / OpenAPI
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'LearningLanguageApp API',
        version: '0.1.0',
        description: 'Japanese learning app API with Supabase Auth',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Paste the access_token from POST /auth/login',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
      persistAuthorization: true,
    },
  });


  // Prisma
  await app.register(prismaPlugin);

  // Routes
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(userRoutes, { prefix: '/users' });
  await app.register(lessonRoutes, { prefix: '/lessons' });
  await app.register(timelineRoutes, { prefix: '/timelines' });
  await app.register(grammarRoutes, { prefix: '/grammars' });
  await app.register(adminLessonRoutes, { prefix: '/admin/lessons' });
  await app.register(adminTimelineRoutes, { prefix: '/admin/timelines' });
  await app.register(adminGrammarRoutes, { prefix: '/admin/grammars' });
  await app.register(adminSettingsRoutes, { prefix: '/admin/settings' });
  await app.register(adminUsersRoutes, { prefix: '/admin/users' });
  await app.register(adminQuizRoutes, { prefix: '/admin/quizzes' });
  await app.register(adminFlashcardRoutes, { prefix: '/admin/flashcards' });
  await app.register(flashcardRoutes, { prefix: '/flashcards' });
  await app.register(quizRoutes, { prefix: '/quizzes' });
  await app.register(notificationRoutes, { prefix: '/notifications' });
  await app.register(paymentRoutes, { prefix: '/payment' });

  return app;
}
