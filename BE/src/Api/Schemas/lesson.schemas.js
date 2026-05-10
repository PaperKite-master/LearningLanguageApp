import { Type } from '@sinclair/typebox';

export const LessonDtoSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  timelineId: Type.Union([Type.String(), Type.Null()]),
  topic: Type.Union([Type.String(), Type.Null()]),
  status: Type.Union([Type.Literal('draft'), Type.Literal('published')]),
  videoUrl: Type.Union([Type.String(), Type.Null()]),
  contentMarkdown: Type.Union([Type.String(), Type.Null()]),
  order: Type.Integer(),
  createdAt: Type.Union([Type.String(), Type.Null()])
});

export const LessonIdParamsSchema = Type.Object({
  id: Type.String()
});

export const ListLessonsResponseSchema = Type.Object({
  data: Type.Array(LessonDtoSchema)
});

export const LessonResponseSchema = Type.Object({
  data: LessonDtoSchema
});

