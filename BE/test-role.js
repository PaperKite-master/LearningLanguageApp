import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.profiles.findFirst();
    if (user) {
      console.log('Found user:', user.id);
      await prisma.profiles.update({
        where: { id: user.id },
        data: { role: 'PRO' }
      });
      console.log('Update successful!');
    }
  } catch (err) {
    console.error('Update failed:', err.message, err.code);
  } finally {
    await prisma.$disconnect();
  }
}

test();
