import { Type } from '@sinclair/typebox';

const GoalProgressSchema = Type.Object({
  completed: Type.Integer(),
  target: Type.Integer(),
});

export const DashboardResponseSchema = Type.Object({
  status: Type.Literal('success'),
  data: Type.Object({
    user: Type.Object({
      name: Type.String(),
      avatarUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      visibility: Type.Optional(Type.Union([Type.Boolean(), Type.Null()])),
      phone: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      address: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      bio: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      preferredContact: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    }),
    stats: Type.Object({
      streak: Type.Integer(),
      target: Type.String(),
      totalHours: Type.Integer(),
      weeklyGrowth: Type.Number(),
    }),
    dailyGoals: Type.Object({
      lessons: GoalProgressSchema,
      flashcards: GoalProgressSchema,
      practice: GoalProgressSchema,
    }),
  }),
});

export const StudyTimeBodySchema = Type.Object({
  minutes: Type.Number({ minimum: 1, description: 'Số phút học cần cộng dồn' }),
});

export const StudyTimeResponseSchema = Type.Object({
  status: Type.Literal('success'),
  data: Type.Object({
    totalStudyMinutes: Type.Integer(),
    totalHours: Type.Integer(),
  }),
});

export const UserErrorResponseSchema = Type.Object({
  error: Type.String(),
  statusCode: Type.Number(),
});

export const UpdateProfileBodySchema = Type.Object({
  targetLevel: Type.Optional(Type.String()),
  fullName: Type.Optional(Type.String()),
  newPassword: Type.Optional(Type.String()),
  avatarUrl: Type.Optional(Type.String()),
  visibility: Type.Optional(Type.Boolean()),
  phone: Type.Optional(Type.String()),
  address: Type.Optional(Type.String()),
  bio: Type.Optional(Type.String()),
  preferredContact: Type.Optional(Type.String()),
});

export const UpdateProfileResponseSchema = Type.Object({
  status: Type.Literal('success'),
  message: Type.String(),
  data: Type.Object({
    targetLevel: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    fullName: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    avatarUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    visibility: Type.Optional(Type.Union([Type.Boolean(), Type.Null()])),
    phone: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    address: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    bio: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    preferredContact: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  }),
});
export const ChangePasswordBodySchema = Type.Object({
  oldPassword: Type.String(),
  newPassword: Type.String(),
});

export const SuccessMessageResponseSchema = Type.Object({
  status: Type.Literal('success'),
  message: Type.String(),
});
