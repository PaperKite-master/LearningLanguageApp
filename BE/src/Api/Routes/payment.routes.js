import { paymentController } from '../Controllers/payment.controller.js';
import { authenticate } from '../Middlewares/authenticate.js';
import {
  CreatePaymentBodySchema,
  VerifyTransactionQuerySchema,
  CreatePaymentResponseSchema,
  VerifyTransactionResponseSchema,
} from '../Schemas/payment.schemas.js';
import { ErrorResponseSchema } from '../Schemas/auth.schema.js';

export async function paymentRoutes(fastify, options) {
  fastify.post('/create-url', {
    preHandler: [authenticate],
    schema: {
      tags: ['Payment'],
      summary: 'Create a VNPay payment URL',
      description: 'Generates a payment URL and creates a pending transaction record.',
      security: [{ bearerAuth: [] }],
      body: CreatePaymentBodySchema,
      response: {
        200: CreatePaymentResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: paymentController.createPaymentUrl,
  });

  fastify.get('/vnpay-ipn', {
    schema: {
      tags: ['Payment'],
      summary: 'VNPay IPN webhook callback',
      description: 'Asynchronous webhook called by VNPay to confirm transaction status.',
      // Query parameters come dynamically from VNPay, no strict schema validation here to avoid check conflicts.
    },
    handler: paymentController.vnpayIpn,
  });

  fastify.get('/verify-transaction', {
    schema: {
      tags: ['Payment'],
      summary: 'Verify transaction status',
      description: 'Queries the status of a payment transaction using orderId.',
      querystring: VerifyTransactionQuerySchema,
      response: {
        200: VerifyTransactionResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: paymentController.verifyTransaction,
  });

  fastify.post('/create-momo-url', {
    preHandler: [authenticate],
    schema: {
      tags: ['Payment'],
      summary: 'Create a MoMo payment URL',
      description: 'Generates a MoMo payment URL and creates a pending transaction record.',
      security: [{ bearerAuth: [] }],
      body: CreatePaymentBodySchema,
      response: {
        200: CreatePaymentResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: paymentController.createMomoUrl,
  });

  fastify.post('/momo-ipn', {
    schema: {
      tags: ['Payment'],
      summary: 'MoMo IPN webhook callback',
      description: 'Asynchronous webhook called by MoMo to confirm transaction status.',
    },
    handler: paymentController.momoIpn,
  });

  fastify.post('/create-payos-url', {
    preHandler: [authenticate],
    schema: {
      tags: ['Payment'],
      summary: 'Create a PayOS payment URL',
      description: 'Generates a PayOS payment URL and creates a pending transaction record.',
      security: [{ bearerAuth: [] }],
      body: CreatePaymentBodySchema,
      response: {
        200: CreatePaymentResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: paymentController.createPayOsUrl,
  });

  fastify.post('/payos-ipn', {
    schema: {
      tags: ['Payment'],
      summary: 'PayOS IPN webhook callback',
      description: 'Asynchronous webhook called by PayOS to confirm transaction status.',
    },
    handler: paymentController.payosIpn,
  });
}
