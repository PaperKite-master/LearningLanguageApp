import { PrismaClient } from '@prisma/client';
import { updateLessonUseCase } from './src/Application/UseCases/updateLesson.usecase.js';
import { PrismaLessonRepository } from './src/Infrastructure/Repositories/PrismaLessonRepository.js';

const prisma = new PrismaClient();

(async () => {
  try {
    const lesson = await prisma.lessons.findFirst();
    if (!lesson) {
      console.log('No lesson found');
      process.exit(1);
    }
    const repo = new PrismaLessonRepository(prisma);

    const payload = {
      title: lesson.title,
      vocabularies: [
        {
          hiragana: 'api-test',
          meaning: 'api-test-meaning',
          questions: [
            {
              question_type: 'typing',
              question_text: 'api-test-q',
              options: { answer: 'api-test-a' }
            }
          ]
        }
      ]
    };

    const res = await updateLessonUseCase({ lessonRepo: repo, id: lesson.id, payload });
    console.log('UseCase returned:', JSON.stringify(res, null, 2));

    const check = await prisma.lessons.findFirst({
      where: { id: lesson.id },
      include: { vocabulary: { include: { questions: true } } }
    });
    console.log('DB saved:', JSON.stringify(check.vocabulary, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
