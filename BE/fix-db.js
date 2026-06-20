import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixConstraint() {
  try {
    console.log('Dropping old constraint...');
    await prisma.$executeRawUnsafe(`ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;`);
    
    console.log('Adding new constraint...');
    await prisma.$executeRawUnsafe(`ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('USER', 'ADMIN', 'PRO', 'GUEST'));`);

    console.log('Doing same for auth.users if it exists...');
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE auth.users DROP CONSTRAINT IF EXISTS users_role_check;`);
      await prisma.$executeRawUnsafe(`ALTER TABLE auth.users ADD CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN', 'PRO', 'GUEST'));`);
    } catch (e) {
      console.log('auth.users role check might not exist, skipping.');
    }

    console.log('Constraint updated successfully!');
  } catch (err) {
    console.error('Failed to update constraint:', err);
  } finally {
    await prisma.$disconnect();
  }
}

fixConstraint();
