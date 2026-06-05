import { Type } from '@sinclair/typebox';

export const GetQuizParamsSchema = Type.Object({
  id: Type.String({ format: 'uuid', description: 'Quiz ID' }),
});

export const GetQuizByTimelineParamsSchema = Type.Object({
  timelineId: Type.String({ format: 'uuid', description: 'Timeline ID' }),
});

export const GetQuizByLessonParamsSchema = Type.Object({
  lessonId: Type.String({ format: 'uuid', description: 'Lesson ID' }),
});

export const SubmitQuizBodySchema = Type.Object({
  answers: Type.Array(
    Type.Object({
      questionId: Type.String({ format: 'uuid', description: 'ID of the question' }),
      answerIndex: Type.Number({ description: 'Index of the selected option (0, 1, 2...)' }),
    }),
    { description: 'Array of user answers' }
  ),
});

export const GenericMessageResponseSchema = Type.Object({
  message: Type.String(),
});

export const ErrorResponseSchema = Type.Object({
  error: Type.String(),
  statusCode: Type.Number(),
});
