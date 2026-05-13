import '@prisma/client';
import { PrismaFlashcardRepository } from './Infrastructure/Repositories/PrismaFlashcardRepository.js';
import { PrismaLessonRepository } from './Infrastructure/Repositories/PrismaLessonRepository.js';
import { PrismaGrammarRepository } from './Infrastructure/Repositories/PrismaGrammarRepository.js';
import { PrismaTimelineRepository } from './Infrastructure/Repositories/PrismaTimelineRepository.js';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: import('@prisma/client').PrismaClient;
  }

  interface FastifyRequest {
    // Injected by lessonRepo.middleware.js
    lessonRepo?: InstanceType<typeof PrismaLessonRepository>;

    // Injected by grammarRepo.middleware.js
    grammarRepo?: InstanceType<typeof PrismaGrammarRepository>;

    // Injected by timelineRepo.middleware.js
    timelineRepo?: InstanceType<typeof PrismaTimelineRepository>;

    // Injected by flashcardRepo.middleware.js
    flashcardRepo?: InstanceType<typeof PrismaFlashcardRepository>;

    // Injected by authenticate.js middleware (decoded Supabase JWT)
    user?: {
      sub: string;
      email?: string;
      role?: string;
      app_metadata?: Record<string, any>;
      user_metadata?: Record<string, any>;
      [key: string]: any;
    };
  }
}

