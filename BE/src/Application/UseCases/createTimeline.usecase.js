import { toTimelineDto } from '../DTOs/TimelineDto.js';

export async function createTimelineUseCase({ timelineRepo, payload }) {
  const timeline = await timelineRepo.create(payload);
  return toTimelineDto(timeline);
}
