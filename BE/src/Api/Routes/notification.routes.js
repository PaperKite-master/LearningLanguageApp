import { authenticate } from '../Middlewares/authenticate.js';
import { notificationController } from '../Controllers/notification.controller.js';
import {
  NotificationConfigResponseSchema,
  UpdateNotificationConfigBodySchema,
  GenericMessageResponseSchema,
} from '../Schemas/notification.schemas.js';

const ErrorResponseSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    statusCode: { type: 'number' },
  },
};

export async function notificationRoutes(app) {
  // ─── GET /notifications/config ────────────────────────────────────────────
  app.get('/config', {
    preHandler: [authenticate],
    schema: {
      tags: ['Notifications'],
      summary: 'Get notification config',
      description: 'Returns the current user\'s daily reminder email configuration.',
      security: [{ bearerAuth: [] }],
      response: {
        200: NotificationConfigResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: notificationController.getConfig,
  });

  // ─── PUT /notifications/config ────────────────────────────────────────────
  app.put('/config', {
    preHandler: [authenticate],
    schema: {
      tags: ['Notifications'],
      summary: 'Update notification config',
      description:
        'Enable/disable daily reminder email and set the preferred time and timezone. ' +
        'All fields are optional — only provided fields will be updated.',
      security: [{ bearerAuth: [] }],
      body: UpdateNotificationConfigBodySchema,
      response: {
        200: NotificationConfigResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: notificationController.updateConfig,
  });

  // ─── POST /notifications/send-test ───────────────────────────────────────
  app.post('/send-test', {
    preHandler: [authenticate],
    schema: {
      tags: ['Notifications'],
      summary: 'Send test reminder email',
      description: 'Immediately sends a reminder email to the authenticated user for testing.',
      security: [{ bearerAuth: [] }],
      response: {
        200: GenericMessageResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: notificationController.sendTest,
  });
}
