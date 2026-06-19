import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  const less = await prisma.lessons.findFirst({
    include: { vocabulary: { include: { questions: true } } }
  });
  console.dir(less.vocabulary, { depth: null });
  await prisma.$disconnect();
})();
