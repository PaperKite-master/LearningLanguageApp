export async function deleteLessonUseCase({ lessonRepo, id }) {
  await lessonRepo.delete(id);
}
