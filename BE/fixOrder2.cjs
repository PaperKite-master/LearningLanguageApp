const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const lessons = await prisma.lessons.findMany();
  for (const lesson of lessons) {
    const match = lesson.title.match(/Bài (\d+):/i);
    if (match) {
      const num = parseInt(match[1]);
      await prisma.lessons.update({
        where: { id: lesson.id },
        data: { order: num }
      });
      console.log(`Updated ${lesson.title} to order ${num}`);
    }
  }
}

fix()
  .then(() => console.log('Done'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
