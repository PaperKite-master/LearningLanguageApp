import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const quizzes = await prisma.quizzes.findMany({ take: 1 });
    if (quizzes.length > 0) {
      const q = await prisma.quizzes.update({
        where: { id: quizzes[0].id },
        data: { title: quizzes[0].title + ' Updated' }
      });
      console.log('Update success', q);
    }
  } catch(e) {
    console.error('Update failed', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
