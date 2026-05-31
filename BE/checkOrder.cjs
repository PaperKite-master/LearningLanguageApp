const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const lessons = await prisma.lessons.findMany({ orderBy: { created_at: 'asc' } });
  console.log(lessons.map(l => ({ title: l.title, order: l.order })));
}

check()
  .then(() => console.log('Done'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
