import { toTimelineDto } from '../DTOs/TimelineDto.js';

export async function getTimelineUseCase({ timelineRepo, id }) {
  const timeline = await timelineRepo.findById(id);

  if (!timeline) {
    const err = new Error('Timeline not found');
    err.statusCode = 404;
    throw err;
  }

  return toTimelineDto(timeline);
}
