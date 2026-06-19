import { toLessonDto } from '../DTOs/LessonDto.js';

export async function listAdminLessonsUseCase({ lessonRepo }) {
  const lessons = await lessonRepo.listAllWithStats();
  return lessons.map(toLessonDto);
}
