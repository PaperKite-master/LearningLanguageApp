import { toTimelineDto } from '../DTOs/TimelineDto.js';

export async function listTimelinesUseCase({ timelineRepo }) {
  const timelines = await timelineRepo.list();
  return timelines.map(toTimelineDto);
}
