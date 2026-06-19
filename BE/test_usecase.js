import { PrismaClient } from '@prisma/client';
import { PrismaAdminFlashcardDeckRepository } from './src/Infrastructure/Repositories/PrismaAdminFlashcardDeckRepository.js';
import { listAdminFlashcardDecksUseCase } from './src/Application/UseCases/listAdminFlashcardDecks.usecase.js';

const prisma = new PrismaClient();

async function run() {
  try {
    const repo = new PrismaAdminFlashcardDeckRepository(prisma);
    const result = await listAdminFlashcardDecksUseCase({
      adminFlashcardDeckRepo: repo,
      page: 1,
      limit: 20
    });
    console.log(JSON.stringify(result, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
