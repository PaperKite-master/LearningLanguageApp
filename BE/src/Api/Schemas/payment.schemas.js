import { Type } from '@sinclair/typebox';

export const CreatePaymentBodySchema = Type.Object({
  amount: Type.Integer({ minimum: 5000, maximum: 1000000000, description: 'Amount in VND' }),
  orderInfo: Type.String({ minLength: 5, maxLength: 255, description: 'Order description/info' }),
  bankCode: Type.Optional(Type.String({ description: 'Bank code (NCB, VNPAYQR, VISA, etc.)' })),
});

export const VerifyTransactionQuerySchema = Type.Object({
  orderId: Type.String({ description: 'The unique order_id of the transaction' }),
});

export const CreatePaymentResponseSchema = Type.Object({
  paymentUrl: Type.String({ description: 'VNPay payment redirect URL' }),
  orderId: Type.String({ description: 'Internal order ID' }),
});

export const VerifyTransactionResponseSchema = Type.Object({
  orderId: Type.String(),
  amount: Type.Number(),
  orderInfo: Type.String(),
  status: Type.String(), // PENDING, SUCCESS, FAILED
  transactionNo: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String(),
  updatedAt: Type.String(),
});
