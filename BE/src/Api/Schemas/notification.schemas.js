import { Type } from '@sinclair/typebox';

// ─── Response ────────────────────────────────────────────────────────────────

export const NotificationConfigSchema = Type.Object({
  is_enabled: Type.Boolean({ description: 'Whether daily reminders are enabled' }),
  reminder_time: Type.String({
    description: 'Time to send the reminder in HH:MM format (24h)',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
    examples: ['08:00', '20:30'],
  }),
  timezone: Type.String({
    description: 'IANA timezone string',
    examples: ['Asia/Ho_Chi_Minh', 'Asia/Tokyo', 'UTC'],
  }),
  reminder_type: Type.String({
    description: 'Type of reminder: DAILY or ONE_TIME',
    enum: ['DAILY', 'ONE_TIME'],
  }),
  reminder_date: Type.Union([Type.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'YYYY-MM-DD' }), Type.Null()]),
});

export const NotificationConfigResponseSchema = Type.Object({
  data: NotificationConfigSchema,
});

// ─── Request Body ────────────────────────────────────────────────────────────

export const UpdateNotificationConfigBodySchema = Type.Object({
  is_enabled: Type.Optional(Type.Boolean({ description: 'Enable or disable reminders' })),
  reminder_time: Type.Optional(
    Type.String({
      description: 'Time in HH:MM format (24h). Example: "08:00"',
      pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
    })
  ),
  timezone: Type.Optional(
    Type.String({ description: 'IANA timezone. Example: "Asia/Ho_Chi_Minh"' })
  ),
  reminder_type: Type.Optional(
    Type.String({ enum: ['DAILY', 'ONE_TIME'], description: 'Type of reminder' })
  ),
  reminder_date: Type.Optional(
    Type.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'YYYY-MM-DD format. Required if ONE_TIME' })
  ),
});

// ─── Generic message (for send-test) ─────────────────────────────────────────

export const GenericMessageResponseSchema = Type.Object({
  message: Type.String(),
});
