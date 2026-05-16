import { getLessonUseCase } from '../../Application/UseCases/getLesson.usecase.js';
import { listLessonsUseCase } from '../../Application/UseCases/listLessons.usecase.js';
import { updateLessonProgressUseCase } from '../../Application/UseCases/updateLessonProgress.usecase.js';

export const lessonController = {
  list: async (request, reply) => {
    const lessons = await listLessonsUseCase({ lessonRepo: request.lessonRepo });
    return reply.send({ data: lessons });
  },

  detail: async (request, reply) => {
    try {
      const lesson = await getLessonUseCase({
        lessonRepo: request.lessonRepo,
        id: request.params.id
      });

      return reply.send({ data: lesson });
    } catch (err) {
      if (err?.statusCode === 404) {
        return reply.code(404).send({ error: 'Lesson not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request params' });
      }
      throw err;
    }
  },

  progress: async (request, reply) => {
    try {
      const userId = request.user.sub;
      const progress = await updateLessonProgressUseCase({
        prisma: request.server.prisma,
        userId,
        lessonId: request.params.id,
        event: request.body.event
      });

      return reply.code(200).send({ data: progress });
    } catch (err) {
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request params' });
      }
      throw err;
    }
  }
};

