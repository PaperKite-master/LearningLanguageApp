const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    // get an admin user token directly or mock the auth
    // Let's just create a token for a known admin user, or disable auth for a second.
    // Actually, I can just use a fake token if I disable authenticate middleware? No, I can't.
    // Let's find an admin user.
    const adminUser = await prisma.users.findFirst({ where: { role: 'ADMIN' } }); // Or is_super_admin: true
    if (!adminUser) {
      console.log('No admin user found');
      // Let's search for any user
      const anyUser = await prisma.users.findFirst();
      console.log('Any user:', anyUser);
    } else {
      console.log('Admin user found:', adminUser.email);
    }
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
