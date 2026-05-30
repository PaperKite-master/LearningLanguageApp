import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function seed() {
  try {
    const newQ = await prisma.quizzes.create({
      data: {
        title: 'Bài Test N5 Mẫu',
        passing_score: 80,
        questions: {
          create: [
            {
              question_text: 'Từ vựng nào có nghĩa là Xin chào?',
              options: [{text: 'Ohayou', isCorrect: true}, {text: 'Sayounara', isCorrect: false}],
              order: 1
            }
          ]
        }
      }
    });
    console.log('QUIZ_ID_CREATED=' + newQ.id);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
seed();
