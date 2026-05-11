export async function deleteTimelineUseCase({ timelineRepo, id }) {
  await timelineRepo.delete(id);
}
