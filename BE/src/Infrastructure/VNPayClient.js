import { VNPay } from 'vnpay';

// Instantiate the VNPay client with Sandbox credentials.
// Falls back to public VNPay Sandbox testing credentials if not configured in .env.
export const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMN_CODE || 'OL1IYRDI',
  secureSecret: process.env.VNP_HASH_SECRET || 'CA40T943V5GNUCKYIQHGPC8462G7UQ60',
  vnpayHost: 'https://sandbox.vnpayment.vn',
  testMode: true,
  hashAlgorithm: process.env.VNP_HASH_ALGORITHM || 'SHA512',
});
