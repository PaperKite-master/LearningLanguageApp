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
      answerIndex: Type.Optional(Type.Number({ description: 'Index of the selected option (0, 1, 2...)' })),
      answerText: Type.Optional(Type.String({ description: 'Text answer for fill in blank / typing' })),
      answerPairs: Type.Optional(Type.Array(
        Type.Object({
          left: Type.String(),
          right: Type.String()
        }),
        { description: 'Pairs for matching questions' }
      )),
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
