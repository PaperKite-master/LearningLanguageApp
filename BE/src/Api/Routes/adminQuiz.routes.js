import { authenticate } from '../Middlewares/authenticate.js';
import { requireAdmin } from '../Middlewares/requireAdmin.middleware.js';
import { adminQuizController } from '../Controllers/adminQuiz.controller.js';
import {
  AdminQuizResponseSchema,
  CreateAdminQuizBodySchema,
  UpdateAdminQuizBodySchema,
  AdminQuestionResponseSchema,
  CreateAdminQuestionBodySchema,
  UpdateAdminQuestionBodySchema,
} from '../Schemas/adminQuiz.schemas.js';
import { Type } from '@sinclair/typebox';

export async function adminQuizRoutes(app) {
  app.get(
    '/',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Quizzes'],
        summary: 'Get all quizzes with avg score',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              data: Type.Array(AdminQuizResponseSchema),
            },
          },
        },
      },
    },
    adminQuizController.getQuizzes
  );

  app.post(
    '/',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Quizzes'],
        summary: 'Create a new quiz',
        security: [{ bearerAuth: [] }],
        body: CreateAdminQuizBodySchema,
      },
    },
    adminQuizController.createQuiz
  );

  app.put(
    '/:id',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Quizzes'],
        summary: 'Update a quiz',
        security: [{ bearerAuth: [] }],
        params: Type.Object({ id: Type.String({ format: 'uuid' }) }),
        body: UpdateAdminQuizBodySchema,
      },
    },
    adminQuizController.updateQuiz
  );

  app.delete(
    '/:id',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Quizzes'],
        summary: 'Delete a quiz',
        security: [{ bearerAuth: [] }],
        params: Type.Object({ id: Type.String({ format: 'uuid' }) }),
      },
    },
    adminQuizController.deleteQuiz
  );

  // --- Questions Management ---
  app.get(
    '/:id/questions',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Quizzes'],
        summary: 'Get all questions of a quiz',
        security: [{ bearerAuth: [] }],
        params: Type.Object({ id: Type.String({ format: 'uuid' }) }),
        response: {
          200: {
            type: 'object',
            properties: {
              data: Type.Array(AdminQuestionResponseSchema),
            },
          },
        },
      },
    },
    adminQuizController.getQuestions
  );

  app.post(
    '/:id/questions',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Quizzes'],
        summary: 'Create a question for a quiz',
        security: [{ bearerAuth: [] }],
        params: Type.Object({ id: Type.String({ format: 'uuid' }) }),
        body: CreateAdminQuestionBodySchema,
      },
    },
    adminQuizController.createQuestion
  );

  app.put(
    '/:id/questions/:questionId',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Quizzes'],
        summary: 'Update a question',
        security: [{ bearerAuth: [] }],
        params: Type.Object({
          id: Type.String({ format: 'uuid' }),
          questionId: Type.String({ format: 'uuid' }),
        }),
        body: UpdateAdminQuestionBodySchema,
      },
    },
    adminQuizController.updateQuestion
  );

  app.delete(
    '/:id/questions/:questionId',
    {
      preHandler: [authenticate, requireAdmin],
      schema: {
        tags: ['Admin Quizzes'],
        summary: 'Delete a question',
        security: [{ bearerAuth: [] }],
        params: Type.Object({
          id: Type.String({ format: 'uuid' }),
          questionId: Type.String({ format: 'uuid' }),
        }),
      },
    },
    adminQuizController.deleteQuestion
  );
}
