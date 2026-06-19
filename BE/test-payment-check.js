import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const orderId = process.argv[2];

if (!orderId) {
  console.error('Please provide the orderId. Example: node test-payment-check.js 17811002036451496');
  process.exit(1);
}

async function run() {
  try {
    const transaction = await prisma.payment_transactions.findUnique({
      where: { order_id: orderId }
    });

    if (!transaction) {
      console.log(`Transaction with Order ID "${orderId}" not found in database.`);
      return;
    }

    console.log('\n=============================================');
    console.log('TRANSACTION STATUS IN DATABASE');
    console.log('=============================================');
    console.log(`Order ID       : ${transaction.order_id}`);
    console.log(`Amount         : ${transaction.amount.toLocaleString()} VND`);
    console.log(`Info           : ${transaction.order_info}`);
    console.log(`Status         : ${transaction.status}`);
    console.log(`Transaction No : ${transaction.transaction_no || 'N/A'}`);
    console.log(`Created At     : ${transaction.created_at}`);
    console.log(`Updated At     : ${transaction.updated_at}`);
    console.log('=============================================\n');

  } catch (err) {
    console.error('Error querying transaction:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
