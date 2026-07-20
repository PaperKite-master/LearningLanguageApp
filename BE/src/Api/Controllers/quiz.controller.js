import { getQuizUseCase } from '../../Application/UseCases/getQuiz.usecase.js';
import { submitQuizResultUseCase } from '../../Application/UseCases/submitQuizResult.usecase.js';
import { getQuizByTimelineUseCase } from '../../Application/UseCases/getQuizByTimeline.usecase.js';
import { getQuizByLessonUseCase } from '../../Application/UseCases/getQuizByLesson.usecase.js';
import {
  assertLessonAccessible,
  assertTimelineAccessible,
  getUserRole,
} from '../../Shared/planAccess.js';

async function getQuizTimelineId(prisma, quizId) {
  const quiz = await prisma.quizzes.findUnique({
    where: { id: quizId },
    select: { timeline_id: true, lesson_id: true },
  });
  if (!quiz) return { timelineId: null, lessonId: null };

  if (quiz.timeline_id) {
    return { timelineId: quiz.timeline_id, lessonId: quiz.lesson_id };
  }

  if (quiz.lesson_id) {
    const lesson = await prisma.lessons.findUnique({
      where: { id: quiz.lesson_id },
      select: { timeline_id: true },
    });
    return { timelineId: lesson?.timeline_id ?? null, lessonId: quiz.lesson_id };
  }

  return { timelineId: null, lessonId: null };
}

export const quizController = {
  getQuiz: async (req, reply) => {
    try {
      const { id } = req.params;
      const role = await getUserRole(req.server.prisma, req.user.sub);
      const { timelineId, lessonId } = await getQuizTimelineId(req.server.prisma, id);

      if (lessonId) {
        await assertLessonAccessible(req.server.prisma, lessonId, role);
      } else {
        await assertTimelineAccessible(req.server.prisma, timelineId, role);
      }

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
      const role = await getUserRole(req.server.prisma, req.user.sub);
      await assertTimelineAccessible(req.server.prisma, timelineId, role);

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
      const role = await getUserRole(req.server.prisma, req.user.sub);
      await assertLessonAccessible(req.server.prisma, lessonId, role);

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
      const userId = req.user.sub;
      const role = await getUserRole(req.server.prisma, userId);
      const { timelineId, lessonId } = await getQuizTimelineId(req.server.prisma, id);

      if (lessonId) {
        await assertLessonAccessible(req.server.prisma, lessonId, role);
      } else {
        await assertTimelineAccessible(req.server.prisma, timelineId, role);
      }

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
