import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const quiz = await prisma.quizzes.findFirst({ where: { lesson_id: { not: null } } });
  console.log('Quiz mapped to lesson_id:', quiz.lesson_id);
  const lesson = await prisma.lessons.findUnique({ where: { id: quiz.lesson_id } });
  console.log('Lesson:', lesson);
}
main().catch(console.error).finally(() => prisma.$disconnect());
