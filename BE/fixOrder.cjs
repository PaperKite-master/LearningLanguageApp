const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const lessons = await prisma.lessons.findMany({ orderBy: { created_at: 'asc' } });
  for (let i = 0; i < lessons.length; i++) {
    await prisma.lessons.update({
      where: { id: lessons[i].id },
      data: { order: i + 1 }
    });
  }
}

fix()
  .then(() => console.log('Done'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
