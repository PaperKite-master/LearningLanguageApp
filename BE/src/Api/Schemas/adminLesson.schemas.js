import { Type } from '@sinclair/typebox';
import { LessonDtoSchema } from './lesson.schemas.js';

export const LessonIdParamsSchema = Type.Object({
  id: Type.String()
});

export const CreateLessonBodySchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  timelineId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  topic: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  status: Type.Optional(Type.Union([
    Type.Literal('draft'),
    Type.Literal('published')
  ], { default: 'published' })),
  videoUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  contentMarkdown: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  order: Type.Optional(Type.Integer({ minimum: 0 })),
  lessonCode: Type.Optional(Type.Union([Type.String(), Type.Null()]))
});

export const UpdateLessonBodySchema = Type.Partial(CreateLessonBodySchema);

export const LessonResponseSchema = Type.Object({
  data: LessonDtoSchema
});

export const ListAdminLessonsResponseSchema = Type.Object({
  data: Type.Array(LessonDtoSchema)
});

