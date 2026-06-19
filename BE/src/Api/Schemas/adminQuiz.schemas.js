import { Type } from '@sinclair/typebox';

export const AdminQuizResponseSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  title: Type.String(),
  type: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  passing_score: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  status: Type.Optional(Type.String()),
  level: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  lesson_id: Type.Optional(Type.Union([Type.String({ format: 'uuid' }), Type.Null()])),
  timeline_id: Type.Optional(Type.Union([Type.String({ format: 'uuid' }), Type.Null()])),
  created_at: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  question_count: Type.Optional(Type.Number()),
  avg_score: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  time_limit: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
  tags: Type.Optional(Type.Array(Type.String())),
  pass_rate: Type.Optional(Type.Number()),
  attempts: Type.Optional(Type.Number()),
});

export const CreateAdminQuizBodySchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  type: Type.Optional(Type.String()),
  passing_score: Type.Optional(Type.Number()),
  status: Type.Optional(Type.String()),
  level: Type.Optional(Type.String()),
  lesson_id: Type.Optional(Type.Union([Type.String({ format: 'uuid' }), Type.Null()])),
  timeline_id: Type.Optional(Type.Union([Type.String({ format: 'uuid' }), Type.Null()])),
  time_limit: Type.Optional(Type.Number()),
  tags: Type.Optional(Type.Array(Type.String())),
});

export const UpdateAdminQuizBodySchema = Type.Partial(CreateAdminQuizBodySchema);

export const AdminQuestionResponseSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  quiz_id: Type.Optional(Type.Union([Type.String({ format: 'uuid' }), Type.Null()])),
  question_text: Type.String(),
  question_type: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  options: Type.Optional(Type.Any()), // JSON
  explanation: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  order: Type.Optional(Type.Union([Type.Number(), Type.Null()])),
});

export const CreateAdminQuestionBodySchema = Type.Object({
  question_text: Type.String(),
  question_type: Type.Optional(Type.String()),
  options: Type.Optional(Type.Any()),
  explanation: Type.Optional(Type.String()),
  order: Type.Optional(Type.Number()),
});

export const UpdateAdminQuestionBodySchema = Type.Partial(CreateAdminQuestionBodySchema);
