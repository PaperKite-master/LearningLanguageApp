import { createLessonUseCase } from '../../Application/UseCases/createLesson.usecase.js';
import { updateLessonUseCase } from '../../Application/UseCases/updateLesson.usecase.js';
import { deleteLessonUseCase } from '../../Application/UseCases/deleteLesson.usecase.js';
import { listAdminLessonsUseCase } from '../../Application/UseCases/listAdminLessons.usecase.js';

export const adminLessonController = {
  list: async (request, reply) => {
    try {
      const lessons = await listAdminLessonsUseCase({ lessonRepo: request.lessonRepo });
      return reply.code(200).send({ data: lessons });
    } catch (err) {
      request.log.error(err);
      throw err;
    }
  },

  create: async (request, reply) => {
    try {
      const lesson = await createLessonUseCase({
        lessonRepo: request.lessonRepo,
        payload: request.body
      });
      return reply.code(201).send({ data: lesson });
    } catch (err) {
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request body' });
      }
      throw err;
    }
  },

  update: async (request, reply) => {
    try {
      const lesson = await updateLessonUseCase({
        lessonRepo: request.lessonRepo,
        id: request.params.id,
        payload: request.body
      });
      return reply.send({ data: lesson });
    } catch (err) {
      if (err?.code === 'P2025') {
        return reply.code(404).send({ error: 'Lesson not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request body' });
      }
      throw err;
    }
  },

  remove: async (request, reply) => {
    try {
      await deleteLessonUseCase({ lessonRepo: request.lessonRepo, id: request.params.id });
      return reply.code(204).send();
    } catch (err) {
      if (err?.code === 'P2025') {
        return reply.code(404).send({ error: 'Lesson not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request params' });
      }
      throw err;
    }
  }
};

