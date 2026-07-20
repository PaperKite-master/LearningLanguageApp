import { getLessonUseCase } from '../../Application/UseCases/getLesson.usecase.js';
import { listLessonsUseCase } from '../../Application/UseCases/listLessons.usecase.js';
import { updateLessonProgressUseCase } from '../../Application/UseCases/updateLessonProgress.usecase.js';
import {
  assertLessonAccessible,
  assertTimelineAccessible,
  getFirstTimelineId,
  getUserRole,
  hasFullTimelineAccess,
} from '../../Shared/planAccess.js';

export const lessonController = {
  list: async (request, reply) => {
    const lessons = await listLessonsUseCase({ lessonRepo: request.lessonRepo });
    const role = await getUserRole(request.server.prisma, request.user?.sub);

    if (hasFullTimelineAccess(role)) {
      return reply.send({ data: lessons });
    }

    const firstTimelineId = await getFirstTimelineId(request.server.prisma);
    const filtered = lessons.filter((lesson) => lesson.timelineId === firstTimelineId);
    return reply.send({ data: filtered });
  },

  detail: async (request, reply) => {
    try {
      const role = await getUserRole(request.server.prisma, request.user?.sub);
      await assertLessonAccessible(request.server.prisma, request.params.id, role);

      const lesson = await getLessonUseCase({
        lessonRepo: request.lessonRepo,
        id: request.params.id
      });

      return reply.send({ data: lesson });
    } catch (err) {
      if (err?.statusCode === 403) {
        return reply.code(403).send({ error: err.message });
      }
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
      const role = await getUserRole(request.server.prisma, userId);
      await assertLessonAccessible(request.server.prisma, request.params.id, role);

      const progress = await updateLessonProgressUseCase({
        prisma: request.server.prisma,
        userId,
        lessonId: request.params.id,
        event: request.body.event
      });

      return reply.code(200).send({ data: progress });
    } catch (err) {
      if (err?.statusCode === 403) {
        return reply.code(403).send({ error: err.message });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request params' });
      }
      throw err;
    }
  }
};
