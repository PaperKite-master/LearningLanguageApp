import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  const lesson = await prisma.lessons.findUnique({
    where: { id: 'cb2ae152-1cf9-44f4-8e2c-334f1f7b1df6' },
    include: { vocabulary: true }
  });
  console.log(JSON.stringify(lesson.vocabulary, null, 2));
  await prisma.$disconnect();
})();
