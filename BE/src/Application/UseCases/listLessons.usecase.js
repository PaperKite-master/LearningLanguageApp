import { toLessonDto } from '../DTOs/LessonDto.js';

export async function listLessonsUseCase({ lessonRepo }) {
  const lessons = await lessonRepo.list();
  return lessons.map(toLessonDto);
}

