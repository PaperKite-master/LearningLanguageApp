import { Type } from '@sinclair/typebox';
import { LessonDtoSchema } from './lesson.schemas.js';

export const TimelineIdParamsSchema = Type.Object({
  id: Type.String()
});

export const TimelineDtoSchema = Type.Object({
  id: Type.String(),
  title: Type.String(),
  description: Type.Union([Type.String(), Type.Null()]),
  order: Type.Integer(),
  createdAt: Type.Union([Type.String(), Type.Null()]),
  lessons: Type.Array(LessonDtoSchema)
});

export const CreateTimelineBodySchema = Type.Object({
  title: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  order: Type.Optional(Type.Integer({ minimum: 0 }))
});

export const UpdateTimelineBodySchema = Type.Partial(CreateTimelineBodySchema);

export const TimelineResponseSchema = Type.Object({
  data: TimelineDtoSchema
});

export const TimelineListResponseSchema = Type.Object({
  data: Type.Array(TimelineDtoSchema)
});
