const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

async function testApi() {
  const prisma = new PrismaClient();
  const admin = await prisma.users.findFirst({ where: { email: 'admin@gmail.com' }});
  
  if (!admin) {
    console.log("No admin found");
    return;
  }
  
  try {
    // Attempt to hit the api
    const response = await axios.get('http://localhost:4000/admin/flashcard-decks', {
      headers: {
        Authorization: `Bearer FAKE_TOKEN_WILL_FAIL_BUT_WE_CAN_CHECK_IF_IT_IS_REGISTERED`
      }
    });
    console.log(response.data);
  } catch (err) {
    console.log("Status:", err.response?.status);
    console.log("Data:", err.response?.data);
  }
  await prisma.$disconnect();
}

testApi();
