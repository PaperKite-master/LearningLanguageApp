import { Type } from '@sinclair/typebox';

export const AdminSettingsResponseSchema = Type.Object({
  study_reminder_enabled: Type.Boolean(),
  email_reminder_enabled: Type.Boolean(),
  updated_at: Type.Union([Type.String(), Type.Null()]),
});

export const UpdateAdminSettingsBodySchema = Type.Object({
  study_reminder_enabled: Type.Optional(Type.Boolean()),
  email_reminder_enabled: Type.Optional(Type.Boolean()),
});
