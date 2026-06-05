import { quizController } from '../Controllers/quiz.controller.js';
import {
  GetQuizParamsSchema,
  GetQuizByTimelineParamsSchema,
  GetQuizByLessonParamsSchema,
  SubmitQuizBodySchema,
  GenericMessageResponseSchema,
  ErrorResponseSchema,
} from '../Schemas/quiz.schema.js';
import { authenticate } from '../Middlewares/authenticate.js';

export async function quizRoutes(fastify, options) {
  // GET /quizzes/by-timeline/:timelineId
  fastify.get(
    '/by-timeline/:timelineId',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Quizzes'],
        summary: 'Get a quiz by Timeline ID',
        security: [{ bearerAuth: [] }],
        params: GetQuizByTimelineParamsSchema,
        response: {
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    quizController.getQuizByTimeline
  );

  // GET /quizzes/by-lesson/:lessonId
  fastify.get(
    '/by-lesson/:lessonId',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Quizzes'],
        summary: 'Get a quiz by Lesson ID',
        security: [{ bearerAuth: [] }],
        params: GetQuizByLessonParamsSchema,
        response: {
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    quizController.getQuizByLesson
  );

  // GET /quizzes/:id - Get a quiz with its questions
  fastify.get(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Quizzes'],
        summary: 'Get a quiz by ID',
        security: [{ bearerAuth: [] }],
        params: GetQuizParamsSchema,
        response: {
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    quizController.getQuiz
  );

  // POST /quizzes/:id/submit - Submit quiz score
  fastify.post(
    '/:id/submit',
    {
      preHandler: [authenticate],
      schema: {
        tags: ['Quizzes'],
        summary: 'Submit a quiz result',
        security: [{ bearerAuth: [] }],
        params: GetQuizParamsSchema,
        body: SubmitQuizBodySchema,
        response: {
          404: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    quizController.submitResult
  );
}
