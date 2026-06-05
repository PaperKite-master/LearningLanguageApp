import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const quizzes = await prisma.quizzes.findMany();
  console.log(quizzes);
}
main().catch(console.error).finally(() => prisma.$disconnect());
