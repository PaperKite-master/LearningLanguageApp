import { Type } from '@sinclair/typebox';

export const LessonDtoSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  timelineId: Type.Union([Type.String(), Type.Null()]),
  videoUrl: Type.Union([Type.String(), Type.Null()]),
  contentMarkdown: Type.Union([Type.String(), Type.Null()]),
  order: Type.Integer(),
  createdAt: Type.Union([Type.String(), Type.Null()])
});

export const ListLessonsResponseSchema = Type.Object({
  data: Type.Array(LessonDtoSchema)
});

