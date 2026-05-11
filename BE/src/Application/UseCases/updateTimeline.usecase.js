import { toTimelineDto } from '../DTOs/TimelineDto.js';

export async function updateTimelineUseCase({ timelineRepo, id, payload }) {
  const timeline = await timelineRepo.update(id, payload);
  return toTimelineDto(timeline);
}
