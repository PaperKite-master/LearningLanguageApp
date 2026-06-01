import { toLessonDto } from '../DTOs/LessonDto.js';

export async function listAdminLessonsUseCase({ lessonRepo }) {
  const lessons = await lessonRepo.listAll();
  return lessons.map(toLessonDto);
}
