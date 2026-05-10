import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching all lessons...');
  const lessons = await prisma.lessons.findMany({
    orderBy: { created_at: 'asc' }
  });

  console.log(`Found ${lessons.length} lessons. Updating orders...`);

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const newOrder = i + 1;
    await prisma.lessons.update({
      where: { id: lesson.id },
      data: { order: newOrder }
    });
    console.log(`Updated lesson ${lesson.id} -> order: ${newOrder}`);
  }

  console.log('Migration complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
