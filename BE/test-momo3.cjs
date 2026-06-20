const crypto = require('crypto');

const partnerCode = 'MOMO';
const accessKey = 'F8BBA842ECF85';
const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz'; // The correct one from web search!
const amount = '100000';
const orderInfo = 'Test order';
const redirectUrl = 'http://localhost';
const ipnUrl = 'http://localhost';
const orderId = 'MOMO_' + Date.now();
const requestId = orderId;
const requestType = 'payWithMethod';
const extraData = '';

const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

const requestBody = { partnerCode, requestId, amount: Number(amount), orderId, orderInfo, redirectUrl, ipnUrl, lang: 'vi', requestType, autoCapture: true, extraData, signature };

fetch('https://test-payment.momo.vn/v2/gateway/api/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) })
  .then(res => res.json())
  .then(console.log);
