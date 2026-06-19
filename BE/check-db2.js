import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  const lessons = await prisma.lessons.findMany({
    include: { vocabulary: true }
  });
  console.log(lessons.map(l => ({ id: l.id, title: l.title, vocabCount: l.vocabulary.length })));
  await prisma.$disconnect();
})();
