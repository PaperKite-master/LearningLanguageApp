import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  try {
    const result = await prisma.flashcards.updateMany({
      data: { user_id: null }
    });
    console.log(`Updated ${result.count} flashcards to user_id = null`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
