import { MoMoClient } from './src/Infrastructure/MoMoClient.js';

async function test() {
  try {
    const res = await MoMoClient.createPayment(
      'MOMO_TEST_12345',
      100000,
      'Test order',
      'http://localhost',
      'http://localhost'
    );
    console.log(res);
  } catch (err) {
    console.error(err);
  }
}

test();
