import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
    const lesson = await prisma.lessons.findFirst();
    if (!lesson) {
      console.log('No lesson found');
      process.exit(1);
    }
    
    // We will bypass token by just calling the route handler logic or generating a token
    const { updateLessonUseCase } = await import('./src/Application/UseCases/updateLesson.usecase.js');
    const { PrismaLessonRepository } = await import('./src/Infrastructure/Repositories/PrismaLessonRepository.js');
    const repo = new PrismaLessonRepository(prisma);

    const payload = {
      vocabularies: [
        {
          hiragana: 'front_hira',
          romaji: 'front_romaji',
          kanji: 'front_kanji',
          meaning: 'front_meaning',
          questions: []
        }
      ]
    };

    const res = await updateLessonUseCase({ lessonRepo: repo, id: lesson.id, payload });
    console.log('UseCase returned:', JSON.stringify(res, null, 2));

    const check = await prisma.lessons.findFirst({
      where: { id: lesson.id },
      include: { vocabulary: true }
    });
    console.log('DB saved:', JSON.stringify(check.vocabulary, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
