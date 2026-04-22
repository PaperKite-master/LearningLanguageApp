import { toLessonDto } from '../DTOs/LessonDto.js';

export async function createLessonUseCase({ lessonRepo, payload }) {
  const lesson = await lessonRepo.create(payload);
  return toLessonDto(lesson);
}

