import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const result = await prisma.$queryRaw`SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'quizzes_type_check'`;
    console.log(result);
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
