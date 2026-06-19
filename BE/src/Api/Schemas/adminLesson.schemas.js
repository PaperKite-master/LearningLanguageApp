import { Type } from '@sinclair/typebox';
import { LessonDtoSchema } from './lesson.schemas.js';

export const LessonIdParamsSchema = Type.Object({
  id: Type.String()
});

export const QuestionSchema = Type.Object({
  id: Type.Optional(Type.String()),
  question_text: Type.String(),
  question_type: Type.Optional(Type.String()),
  options: Type.Optional(Type.Any()),
  explanation: Type.Optional(Type.Union([Type.String(), Type.Null()]))
});

export const VocabularySchema = Type.Object({
  id: Type.Optional(Type.String()),
  hiragana: Type.String(),
  romaji: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  kanji: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  meaning: Type.String(),
  questions: Type.Optional(Type.Array(QuestionSchema))
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
  lessonCode: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  vocabularies: Type.Optional(Type.Array(VocabularySchema))
});

export const UpdateLessonBodySchema = Type.Partial(CreateLessonBodySchema);

export const LessonResponseSchema = Type.Object({
  data: LessonDtoSchema
});

export const ListAdminLessonsResponseSchema = Type.Object({
  data: Type.Array(LessonDtoSchema)
});

