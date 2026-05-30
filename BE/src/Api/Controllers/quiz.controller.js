import { getQuizUseCase } from '../../Application/UseCases/getQuiz.usecase.js';
import { submitQuizResultUseCase } from '../../Application/UseCases/submitQuizResult.usecase.js';

export const quizController = {
  getQuiz: async (req, reply) => {
    try {
      const { id } = req.params;
      const quiz = await getQuizUseCase(req.server.prisma, id);
      return reply.code(200).send(quiz);
    } catch (error) {
      req.log.error(error);
      return reply.code(error.statusCode || 500).send({
        error: error.message,
        statusCode: error.statusCode || 500,
      });
    }
  },

  submitResult: async (req, reply) => {
    try {
      const { id } = req.params;
      const { answers } = req.body;
      const userId = req.user.id;

      const result = await submitQuizResultUseCase(req.server.prisma, userId, id, answers);
      return reply.code(201).send({
        message: 'Quiz result saved successfully',
        data: result,
      });
    } catch (error) {
      req.log.error(error);
      return reply.code(error.statusCode || 500).send({
        error: error.message,
        statusCode: error.statusCode || 500,
      });
    }
  },
};
