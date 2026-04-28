export function toLessonDto(lesson) {
  return {
    id: lesson.id,
    title: lesson.title,
    timelineId: lesson.timeline_id ?? null,
    topic: lesson.topic ?? null,
    status: lesson.status ?? 'published',
    videoUrl: lesson.video_url ?? null,
    contentMarkdown: lesson.content_markdown ?? null,
    order: lesson.order ?? 0,
    createdAt: lesson.created_at ?? null
  };
}

