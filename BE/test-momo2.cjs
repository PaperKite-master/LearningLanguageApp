const crypto = require('crypto');

const partnerCode = 'MOMOBKUN20180529';
const accessKey = 'klm05TvNCyandXOpt';
const secretKey = 'at67qH6mk8g5i1Pe1JzJWFAoa4syDbwS';
const amount = 100000;
const orderInfo = 'Test order';
const redirectUrl = 'http://localhost';
const ipnUrl = 'http://localhost';
const orderId = 'MOMO_' + Date.now();
const requestId = orderId;
const requestType = 'captureWallet';
const extraData = '';

const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

const requestBody = { partnerCode, requestId, amount: String(amount), orderId, orderInfo, redirectUrl, ipnUrl, lang: 'vi', requestType, autoCapture: true, extraData, signature };

fetch('https://test-payment.momo.vn/v2/gateway/api/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) })
  .then(res => res.json())
  .then(console.log);
