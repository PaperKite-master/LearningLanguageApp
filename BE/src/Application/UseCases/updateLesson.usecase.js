import { toLessonDto } from '../DTOs/LessonDto.js';

export async function updateLessonUseCase({ lessonRepo, id, payload }) {
  console.log('--- PAYLOAD RECEIVED ---');
  console.dir(payload, { depth: null });
  const lesson = await lessonRepo.update(id, payload);
  return toLessonDto(lesson);
}

