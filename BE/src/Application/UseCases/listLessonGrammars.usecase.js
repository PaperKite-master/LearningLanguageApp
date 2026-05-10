import { toGrammarDto } from '../DTOs/GrammarDto.js';

export async function listLessonGrammarsUseCase({ lessonRepo, grammarRepo, lessonId }) {
  const lesson = await lessonRepo.findById(lessonId);

  if (!lesson) {
    const err = new Error('Lesson not found');
    err.statusCode = 404;
    throw err;
  }

  const grammars = await grammarRepo.listByLessonId(lessonId);
  return grammars.map(toGrammarDto);
}
