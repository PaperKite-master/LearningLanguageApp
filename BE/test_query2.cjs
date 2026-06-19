const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.$queryRaw`SELECT last_sign_in_at FROM auth.users LIMIT 1`;
    console.log("last_sign_in_at query success:", res);
  } catch (err) {
    console.error("last_sign_in_at query failed:", err.message);
  }

  try {
    const res2 = await prisma.$queryRaw`SELECT SUM(amount) FROM public.payment_transactions WHERE status='COMPLETED' LIMIT 1`;
    console.log("payment query success:", res2);
  } catch(err) {
    console.error("payment query failed:", err.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
