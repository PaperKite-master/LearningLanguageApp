import { PrismaClient } from '@prisma/client';
import { PrismaLessonRepository } from './src/Infrastructure/Repositories/PrismaLessonRepository.js';

const prisma = new PrismaClient();
(async () => {
  try {
    const lesson = await prisma.lessons.findFirst();
    if (!lesson) return console.log('No lesson');
    const instance = new PrismaLessonRepository(prisma);
    await instance.update(lesson.id, {
      title: lesson.title,
      vocabularies: [
        {
          hiragana: '123',
          meaning: '123',
          questions: [
            {
              question_type: 'multiple_choice',
              question_text: '123',
              options: [ { text: '123', isCorrect: true } ]
            }
          ]
        }
      ]
    });
    console.log('SUCCESS');
  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
