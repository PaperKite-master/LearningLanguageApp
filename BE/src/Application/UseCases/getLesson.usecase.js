import { toLessonDto } from '../DTOs/LessonDto.js';

export async function getLessonUseCase({ lessonRepo, id }) {
  const lesson = await lessonRepo.findById(id);

  if (!lesson) {
    const err = new Error('Lesson not found');
    err.statusCode = 404;
    throw err;
  }

  return toLessonDto(lesson);
}
