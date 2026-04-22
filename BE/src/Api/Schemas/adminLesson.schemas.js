import { Type } from '@sinclair/typebox';
import { LessonDtoSchema } from './lesson.schemas.js';

export const LessonIdParamsSchema = Type.Object({
  id: Type.String()
});

export const CreateLessonBodySchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  timelineId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  videoUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  contentMarkdown: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  order: Type.Optional(Type.Integer({ minimum: 0 }))
});

export const UpdateLessonBodySchema = Type.Partial(CreateLessonBodySchema);

export const LessonResponseSchema = Type.Object({
  data: LessonDtoSchema
});

