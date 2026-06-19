import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  try {
    await prisma.$executeRaw`ALTER TABLE quizzes DROP CONSTRAINT quizzes_type_check;`;
    await prisma.$executeRaw`ALTER TABLE quizzes ADD CONSTRAINT quizzes_type_check CHECK (type = ANY (ARRAY['lesson_test'::text, 'timeline_test'::text, 'mini_game'::text, 'VOCABULARY'::text, 'vocabulary'::text]));`;
    console.log('SUCCESS');
  } catch(e) {
    console.error('ERROR', e);
  } finally {
    await prisma.$disconnect();
  }
})();
