const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const allLessons = await prisma.lessons.findMany({
    orderBy: { created_at: 'asc' }
  });

  for (let i = 0; i < allLessons.length; i++) {
    const code = `L${String(i + 1).padStart(3, '0')}`;
    await prisma.lessons.update({
      where: { id: allLessons[i].id },
      data: { lesson_code: code }
    });
    console.log(`Updated ${allLessons[i].title} with code ${code}`);
  }
}

run()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
