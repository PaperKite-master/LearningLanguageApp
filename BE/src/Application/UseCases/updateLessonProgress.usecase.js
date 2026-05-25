export async function updateLessonProgressUseCase({ prisma, userId, lessonId, event }) {
  const isCompleted = event === 'COMPLETE';

  // First, find the existing progress to check if it's already completed
  const existingProgress = await prisma.user_lesson_progress.findUnique({
    where: {
      user_id_lesson_id: {
        user_id: userId,
        lesson_id: lessonId
      }
    }
  });

  const shouldBeCompleted = existingProgress?.is_completed || isCompleted;

  const progress = await prisma.user_lesson_progress.upsert({
    where: {
      user_id_lesson_id: {
        user_id: userId,
        lesson_id: lessonId
      }
    },
    update: {
      is_completed: shouldBeCompleted,
      last_accessed: new Date()
    },
    create: {
      user_id: userId,
      lesson_id: lessonId,
      is_completed: isCompleted,
      last_accessed: new Date()
    }
  });

  return {
    lessonId: progress.lesson_id,
    isCompleted: Boolean(progress.is_completed),
    lastAccessed: progress.last_accessed?.toISOString() ?? new Date().toISOString()
  };
}