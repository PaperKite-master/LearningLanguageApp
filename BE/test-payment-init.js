const email = 'lethithanhthuy102003@gmail.com';
const password = 'Password123!';

async function run() {
  try {
    console.log('1. Log in to get authentication token...');
    const loginRes = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    console.log('Login successful.');

    console.log('2. Requesting VNPay payment URL from Backend...');
    const createUrlRes = await fetch('http://localhost:4000/payment/create-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: 50000, // 50,000 VND
        orderInfo: 'Nap 50k test he thong HiNa',
        bankCode: 'NCB'
      })
    });

    if (!createUrlRes.ok) {
      const errData = await createUrlRes.json();
      throw new Error(`Create URL failed: ${errData.message || errData.error}`);
    }

    const data = await createUrlRes.json();
    console.log('\n==================================================================');
    console.log('TEST TRANSACTION INITIATED SUCCESSFULLY');
    console.log('==================================================================');
    console.log(`Order ID (vnp_TxnRef) : ${data.orderId}`);
    console.log(`Amount                 : 50,000 VND`);
    console.log(`Status                 : PENDING (Saved in DB)`);
    console.log(`\n👉 Click the link below to pay on VNPay Sandbox:`);
    console.log(`${data.paymentUrl}`);
    console.log('==================================================================\n');
    console.log('NEXT STEPS FOR TESTING:');
    console.log('1. Open the link above in your browser.');
    console.log('2. Pay using the test card details (provided on the screen by VNPay).');
    console.log('3. When redirected to localhost:3000 (which will fail/show blank), copy the entire query string from the address bar (starting with ?).');
    console.log(`4. Paste the query string onto http://localhost:4000/payment/vnpay-ipn<query_string> and hit Enter to simulate the webhook callback.`);
    console.log(`5. To check the transaction status in the database, run: node test-payment-check.js ${data.orderId}`);

  } catch (err) {
    console.error('Test error:', err.message);
  }
}

run();
