import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
    const lesson = await prisma.lessons.findFirst();
    if (!lesson) {
      console.log('No lesson found');
      process.exit(1);
    }
    
    const adminUser = await prisma.users.findFirst({ where: { role: 'admin' }});
    // Create a JWT token for the admin user
    // Wait, the API needs a token. Let's just create a quick mock token or find a token.
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
