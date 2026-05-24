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
