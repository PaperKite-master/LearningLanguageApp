import { listLessonGrammarsUseCase } from '../../Application/UseCases/listLessonGrammars.usecase.js';

export const grammarController = {
  listByLesson: async (request, reply) => {
    try {
      const grammars = await listLessonGrammarsUseCase({
        lessonRepo: request.lessonRepo,
        grammarRepo: request.grammarRepo,
        lessonId: request.query.lessonId
      });

      return reply.send({ data: grammars });
    } catch (err) {
      if (err?.statusCode === 404) {
        return reply.code(404).send({ error: 'Lesson not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request query' });
      }
      throw err;
    }
  }
};
