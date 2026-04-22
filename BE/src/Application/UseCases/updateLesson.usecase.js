import { toLessonDto } from '../DTOs/LessonDto.js';

export async function updateLessonUseCase({ lessonRepo, id, payload }) {
  const lesson = await lessonRepo.update(id, payload);
  return toLessonDto(lesson);
}

