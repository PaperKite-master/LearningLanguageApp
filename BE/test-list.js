import { PrismaClient } from '@prisma/client';
import { listAdminLessonsUseCase } from './src/Application/UseCases/listAdminLessons.usecase.js';
import { PrismaLessonRepository } from './src/Infrastructure/Repositories/PrismaLessonRepository.js';

const prisma = new PrismaClient();

(async () => {
  try {
    const repo = new PrismaLessonRepository(prisma);
    const res = await listAdminLessonsUseCase({ lessonRepo: repo });
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
