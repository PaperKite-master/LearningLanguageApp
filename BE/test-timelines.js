import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const timelines = await prisma.timelines.findMany({ include: { lessons: true } });
  console.log(JSON.stringify(timelines, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
