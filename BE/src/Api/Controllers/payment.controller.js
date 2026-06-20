import { vnpay } from '../../Infrastructure/VNPayClient.js';
import { ProductCode, VnpLocale } from 'vnpay';
import { MoMoClient } from '../../Infrastructure/MoMoClient.js';
import { payOS } from '../../Infrastructure/PayOSClient.js';

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

      // If success, upgrade user to PRO
      if (verify.isSuccess) {
        await prisma.users.update({
          where: { id: transaction.user_id },
          data: { role: 'PRO' }
        });
      }

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

  /**
   * Generate a MoMo payment URL and store the pending transaction in our DB
   */
  async createMomoUrl(req, reply) {
    try {
      const { amount, orderInfo } = req.body;
      const prisma = req.server.prisma;
      const userId = req.user.sub;

      const orderId = 'MOMO_' + Date.now().toString() + Math.floor(1000 + Math.random() * 9000).toString();

      await prisma.payment_transactions.create({
        data: {
          user_id: userId,
          order_id: orderId,
          amount,
          order_info: orderInfo,
          bank_code: 'MOMO',
          status: 'PENDING',
        },
      });

      const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:3000/payment/result';
      const ipnUrl = process.env.MOMO_IPN_URL || 'https://d9f9-118-69-182-149.ngrok-free.app/momo-ipn'; // Requires public URL or ngrok for testing

      const momoResponse = await MoMoClient.createPayment(
        orderId,
        amount,
        orderInfo,
        returnUrl,
        ipnUrl
      );

      return reply.code(200).send({
        paymentUrl: momoResponse.payUrl,
        orderId,
      });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({
        error: 'Failed to create MoMo payment URL',
        message: err.message,
        statusCode: 500,
      });
    }
  },

  /**
   * MoMo IPN Webhook Callback
   */
  async momoIpn(req, reply) {
    const prisma = req.server.prisma;

    try {
      req.log.info({ body: req.body }, 'Received MoMo IPN request');
      const payload = req.body;

      if (!payload || !payload.signature) {
        return reply.code(400).send({ message: 'Missing signature' });
      }

      const isValid = MoMoClient.verifyIpnSignature(payload);
      if (!isValid) {
        return reply.code(400).send({ message: 'Invalid signature' });
      }

      const orderId = payload.orderId;
      const amount = payload.amount;
      const resultCode = payload.resultCode;

      const transaction = await prisma.payment_transactions.findUnique({
        where: { order_id: orderId },
      });

      if (!transaction) {
        return reply.code(404).send({ message: 'Order not found' });
      }

      if (transaction.status !== 'PENDING') {
        return reply.code(200).send({ message: 'Order already processed' });
      }

      const paymentStatus = resultCode === 0 ? 'SUCCESS' : 'FAILED';

      await prisma.payment_transactions.update({
        where: { id: transaction.id },
        data: {
          status: paymentStatus,
          transaction_no: payload.transId?.toString() || null,
          updated_at: new Date(),
        },
      });

      if (resultCode === 0) {
        await prisma.users.update({
          where: { id: transaction.user_id },
          data: { role: 'PRO' }
        });
      }

      // Respond 204 No Content as required by MoMo
      return reply.code(204).send();
    } catch (err) {
      req.log.error(err, 'Error processing MoMo IPN');
      return reply.code(500).send({ message: 'Internal server error' });
    }
  },

  /**
   * Generate a PayOS (VietQR) payment URL and store the pending transaction
   */
  async createPayOsUrl(req, reply) {
    try {
      const { amount, orderInfo } = req.body;
      const prisma = req.server.prisma;
      const userId = req.user.sub;

      // PayOS requires orderCode to be a positive integer (max 53 bits)
      // Let's generate a unique integer. Date.now() + random suffix.
      const orderCode = Number(String(Date.now()).slice(-9) + Math.floor(100 + Math.random() * 900).toString());

      // We still store as order_id string in our DB
      const orderId = orderCode.toString();

      await prisma.payment_transactions.create({
        data: {
          user_id: userId,
          order_id: orderId,
          amount,
          order_info: orderInfo,
          bank_code: 'PAYOS',
          status: 'PENDING',
        },
      });

      const returnUrl = process.env.PAYOS_RETURN_URL || 'http://localhost:3000/payment/result';
      const cancelUrl = process.env.PAYOS_CANCEL_URL || 'http://localhost:3000/payment/result?cancel=true';

      const requestData = {
        orderCode: orderCode,
        amount: amount,
        description: orderInfo.substring(0, 25), // PayOS desc limit is 25 chars
        returnUrl: `${returnUrl}?orderCode=${orderCode}`,
        cancelUrl: `${cancelUrl}&orderCode=${orderCode}`
      };

      const paymentLinkData = await payOS.createPaymentLink(requestData);

      return reply.code(200).send({
        paymentUrl: paymentLinkData.checkoutUrl,
        orderId: orderId,
      });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({
        error: 'Failed to create PayOS payment URL',
        message: err.message,
        statusCode: 500,
      });
    }
  },

  /**
   * PayOS IPN Webhook Callback
   */
  async payosIpn(req, reply) {
    const prisma = req.server.prisma;

    try {
      req.log.info({ body: req.body }, 'Received PayOS IPN request');
      const payload = req.body;

      // Verify the webhook using the SDK
      const webhookData = payOS.verifyPaymentWebhookData(payload);

      const orderId = webhookData.orderCode.toString();
      const amount = webhookData.amount;
      const paymentStatus = webhookData.code === '00' ? 'SUCCESS' : 'FAILED';

      const transaction = await prisma.payment_transactions.findUnique({
        where: { order_id: orderId },
      });

      if (!transaction) {
        return reply.code(404).send({ message: 'Order not found' });
      }

      if (transaction.status !== 'PENDING') {
        return reply.code(200).send({ message: 'Order already processed' });
      }

      await prisma.payment_transactions.update({
        where: { id: transaction.id },
        data: {
          status: paymentStatus,
          transaction_no: webhookData.reference,
          updated_at: new Date(),
        },
      });

      if (webhookData.code === '00') {
        await prisma.users.update({
          where: { id: transaction.user_id },
          data: { role: 'PRO' }
        });
      }

      return reply.code(200).send({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (err) {
      req.log.error(err, 'Error processing PayOS IPN');
      return reply.code(500).send({ message: 'Internal server error' });
    }
  },
};

