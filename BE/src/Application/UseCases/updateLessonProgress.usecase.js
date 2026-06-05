import { logUserActivityUseCase } from './logUserActivity.usecase.js';

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

  let validCompletion = isCompleted;
  
  if (isCompleted) {
    // Check if lesson has a published quiz
    const quiz = await prisma.quizzes.findFirst({
      where: {
        lesson_id: lessonId,
        status: 'published' // assuming LessonStatus enum has 'published'
      }
    });

    if (quiz) {
      // Check if user has passed the quiz
      const passingScore = quiz.passing_score ?? 50;
      const passedResult = await prisma.quiz_results.findFirst({
        where: {
          user_id: userId,
          quiz_id: quiz.id,
          score: {
            gte: passingScore
          }
        }
      });
      if (!passedResult) {
        validCompletion = false; // Cannot complete if quiz is not passed
      }
    }
  }

  const shouldBeCompleted = existingProgress?.is_completed || validCompletion;

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

  if (isCompleted) {
    await logUserActivityUseCase({ prisma, userId, activityType: 'lesson' });
  }

  return {
    lessonId: progress.lesson_id,
    isCompleted: Boolean(progress.is_completed),
    lastAccessed: progress.last_accessed?.toISOString() ?? new Date().toISOString()
  };
}