export function toLessonDto(lesson) {
  // Calculate completion rate if stats are included
  let enrollments = 0;
  let completionRate = 0;
  
  if (lesson._count && lesson._count.user_lesson_progress !== undefined) {
    enrollments = lesson._count.user_lesson_progress;
    if (enrollments > 0 && lesson.user_lesson_progress) {
      const completed = lesson.user_lesson_progress.length;
      completionRate = Math.round((completed / enrollments) * 100);
    }
  }

  return {
    id: lesson.id,
    title: lesson.title,
    timelineId: lesson.timeline_id ?? null,
    topic: lesson.topic ?? null,
    status: lesson.status ?? 'published',
    videoUrl: lesson.video_url ?? null,
    contentMarkdown: lesson.content_markdown ?? null,
    order: lesson.order ?? 0,
    lessonCode: lesson.lesson_code ?? null,
    createdAt: lesson.created_at ?? null,
    enrollments,
    completionRate,
    vocabularies: lesson.vocabulary ? lesson.vocabulary.map(v => ({
      id: v.id,
      kanji: v.kanji,
      hiragana: v.hiragana,
      romaji: v.romaji,
      meaning: v.meaning,
      questions: v.questions ? v.questions.map(q => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
        explanation: q.explanation
      })) : []
    })) : []
  };
}

