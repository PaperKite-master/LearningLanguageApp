import { vnpay } from '../../Infrastructure/VNPayClient.js';
import { ProductCode, VnpLocale } from 'vnpay';

export const paymentController = {
  /**
   * Generate a VNPay payment URL and store the pending transaction in our DB
   */
  async createPaymentUrl(req, reply) {
    try {
      const { amount, orderInfo, bankCode } = req.body;
      const prisma = req.server.prisma;
      const userId = req.user.sub; // From JWT authentication

      // Generate a unique transaction reference (order_id)
      const orderId = Date.now().toString() + Math.floor(1000 + Math.random() * 9000).toString();

      // 1. Create a pending transaction record in the database
      await prisma.payment_transactions.create({
        data: {
          user_id: userId,
          order_id: orderId,
          amount,
          order_info: orderInfo,
          bank_code: bankCode || null,
          status: 'PENDING',
        },
      });

      // 2. Build the VNPay URL
      // Get request IP address (fallback to localhost)
      const ipAddr = req.ip || '127.0.0.1';

      // Get return URL from env or fallback to a default localhost page
      const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:3000/payment/result';

      // Format current time as yyyyMMddHHmmss in GMT+7 to avoid library timezone offset bugs
      const pad = (n) => (n < 10 ? `0${n}` : n).toString();
      const now = new Date();
      const gmt7Offset = now.getTime() + (7 * 60 * 60 * 1000);
      const gmt7Date = new Date(gmt7Offset);
      const vnpCreateDate = `${gmt7Date.getUTCFullYear()}${pad(gmt7Date.getUTCMonth() + 1)}${pad(gmt7Date.getUTCDate())}${pad(gmt7Date.getUTCHours())}${pad(gmt7Date.getUTCMinutes())}${pad(gmt7Date.getUTCSeconds())}`;

      const paymentUrl = vnpay.buildPaymentUrl({
        vnp_Amount: amount, // VNPay SDK automatically multiplies by 100 internally
        vnp_IpAddr: ipAddr,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: returnUrl,
        vnp_Locale: VnpLocale.VN,
        vnp_BankCode: bankCode || undefined,
        vnp_CreateDate: vnpCreateDate,
      });

      return reply.code(200).send({
        paymentUrl,
        orderId,
      });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({
        error: 'Failed to create payment URL',
        message: err.message,
        statusCode: 500,
      });
    }
  },

  /**
   * Webhook callback called asynchronously by VNPay to confirm transaction status (IPN)
   */
  async vnpayIpn(req, reply) {
    const prisma = req.server.prisma;

    try {
      req.log.info({ query: req.query }, 'Received VNPay IPN request');

      // Check if signature parameter is provided to avoid SDK exceptions on empty requests
      if (!req.query || !req.query.vnp_SecureHash) {
        req.log.warn('VNPay IPN Verification Failed: Missing Checksum');
        return reply.send({ RspCode: '97', Message: 'Invalid Checksum' });
      }

      // 1. Verify checksum signature
      const verify = vnpay.verifyIpnCall(req.query);

      if (!verify.isVerified) {
        req.log.warn('VNPay IPN Verification Failed: Invalid Checksum');
        return reply.send({ RspCode: '97', Message: 'Invalid Checksum' });
      }

      const orderId = verify.vnp_TxnRef;
      const vnpAmount = verify.vnp_Amount; // in cents (VND * 100)

      // 2. Locate the transaction in our database
      const transaction = await prisma.payment_transactions.findUnique({
        where: { order_id: orderId },
      });

      if (!transaction) {
        req.log.warn(`VNPay IPN Verification Failed: Order ${orderId} not found`);
        return reply.send({ RspCode: '01', Message: 'Order not found' });
      }

      // 3. Verify the transaction amount (VNPay amount is in cents, so divide by 100)
      if (transaction.amount !== vnpAmount / 100) {
        req.log.warn(`VNPay IPN Verification Failed: Amount mismatch. DB: ${transaction.amount}, VNPay: ${vnpAmount / 100}`);
        return reply.send({ RspCode: '04', Message: 'Amount mismatch' });
      }

      // 4. Verify transaction state (must be PENDING)
      if (transaction.status !== 'PENDING') {
        req.log.info(`VNPay IPN Warning: Order ${orderId} already processed (status: ${transaction.status})`);
        return reply.send({ RspCode: '02', Message: 'Order already confirmed' });
      }

      // 5. Update transaction status based on VNPay result
      const paymentStatus = verify.isSuccess ? 'SUCCESS' : 'FAILED';
      
      await prisma.payment_transactions.update({
        where: { id: transaction.id },
        data: {
          status: paymentStatus,
          transaction_no: verify.vnp_TransactionNo || null,
          updated_at: new Date(),
        },
      });

      req.log.info(`VNPay IPN Success: Updated order ${orderId} status to ${paymentStatus}`);
      return reply.send({ RspCode: '00', Message: 'Confirm Success' });
    } catch (err) {
      req.log.error(err, 'Error processing VNPay IPN');
      return reply.send({ RspCode: '99', Message: 'Unknown Error' });
    }
  },

  /**
   * Get the transaction status from local database
   */
  async verifyTransaction(req, reply) {
    try {
      const { orderId } = req.query;
      const prisma = req.server.prisma;

      const transaction = await prisma.payment_transactions.findUnique({
        where: { order_id: orderId },
      });

      if (!transaction) {
        return reply.code(404).send({
          error: 'Transaction not found',
          statusCode: 404,
        });
      }

      return reply.code(200).send({
        orderId: transaction.order_id,
        amount: transaction.amount,
        orderInfo: transaction.order_info,
        status: transaction.status,
        transactionNo: transaction.transaction_no,
        createdAt: transaction.created_at.toISOString(),
        updatedAt: transaction.updated_at.toISOString(),
      });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({
        error: 'Failed to verify transaction status',
        message: err.message,
        statusCode: 500,
      });
    }
  },
};
