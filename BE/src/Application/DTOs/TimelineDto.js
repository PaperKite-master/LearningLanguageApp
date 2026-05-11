import { toLessonDto } from './LessonDto.js';

export function toTimelineDto(timeline) {
  return {
    id: timeline.id,
    title: timeline.title,
    description: timeline.description ?? null,
    order: timeline.order ?? 0,
    createdAt: timeline.created_at ?? null,
    lessons: Array.isArray(timeline.lessons) ? timeline.lessons.map(toLessonDto) : []
  };
}
