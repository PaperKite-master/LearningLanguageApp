import { logUserActivityUseCase } from './logUserActivity.usecase.js';

export async function updateLessonProgressUseCase({ prisma, userId, lessonId, event }) {
  const isCompleted = event === 'COMPLETE';

  const progress = await prisma.user_lesson_progress.upsert({
    where: {
      user_id_lesson_id: {
        user_id: userId,
        lesson_id: lessonId
      }
    },
    update: {
      is_completed: isCompleted,
      last_accessed: new Date()
    },
    create: {
      user_id: userId,
      lesson_id: lessonId,
      is_completed: isCompleted,
      last_accessed: new Date()
    }
  });

  if (isCompleted) {
    await logUserActivityUseCase({ prisma, userId, activityType: 'lesson' });
  }

  return {
    lessonId: progress.lesson_id,
    isCompleted: Boolean(progress.is_completed),
    lastAccessed: progress.last_accessed?.toISOString() ?? new Date().toISOString()
  };
}