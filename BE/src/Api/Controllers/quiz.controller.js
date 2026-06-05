import { getQuizUseCase } from '../../Application/UseCases/getQuiz.usecase.js';
import { submitQuizResultUseCase } from '../../Application/UseCases/submitQuizResult.usecase.js';
import { getQuizByTimelineUseCase } from '../../Application/UseCases/getQuizByTimeline.usecase.js';
import { getQuizByLessonUseCase } from '../../Application/UseCases/getQuizByLesson.usecase.js';

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

  getQuizByTimeline: async (req, reply) => {
    try {
      const { timelineId } = req.params;
      const quiz = await getQuizByTimelineUseCase(req.server.prisma, timelineId);
      if (!quiz) {
        return reply.code(404).send({ error: 'Quiz not found for this timeline', statusCode: 404 });
      }
      return reply.code(200).send(quiz);
    } catch (error) {
      req.log.error(error);
      return reply.code(error.statusCode || 500).send({
        error: error.message,
        statusCode: error.statusCode || 500,
      });
    }
  },

  getQuizByLesson: async (req, reply) => {
    try {
      const { lessonId } = req.params;
      const quiz = await getQuizByLessonUseCase(req.server.prisma, lessonId);
      if (!quiz) {
        return reply.code(404).send({ error: 'Quiz not found for this lesson', statusCode: 404 });
      }
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
