import { listLessonsUseCase } from '../../Application/UseCases/listLessons.usecase.js';

export const lessonController = {
  list: async (request, reply) => {
    const lessons = await listLessonsUseCase({ lessonRepo: request.lessonRepo });
    return reply.send({ data: lessons });
  }
};

