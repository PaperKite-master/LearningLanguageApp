import axios from 'axios';
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
    if (!adminUser) {
      console.log('No admin found');
      process.exit(1);
    }
    
    // Generate a quick JWT if possible or just test the usecase directly
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
