import { DAILY_GOALS } from '../../Shared/dashboardConstants.js';
import {
  calculateStreak,
  calculateWeeklyGrowth,
} from '../../Shared/dashboardMetrics.js';
import {
  endOfDay,
  getWeekRange,
  startOfDay,
  toDateKey,
} from '../../Shared/dateUtils.js';

async function collectActivityDateKeys(prisma, userId) {
  const [lessons, quizzes, logs] = await Promise.all([
    prisma.user_lesson_progress.findMany({
      where: { user_id: userId, is_completed: true },
      select: { last_accessed: true },
    }),
    prisma.quiz_results.findMany({
      where: { user_id: userId },
      select: { completed_at: true },
    }),
    prisma.user_activity_log.findMany({
      where: { user_id: userId },
      select: { created_at: true },
    }),
  ]);

  const keys = new Set();

  for (const row of lessons) {
    if (row.last_accessed) keys.add(toDateKey(row.last_accessed));
  }
  for (const row of quizzes) {
    if (row.completed_at) keys.add(toDateKey(row.completed_at));
  }
  for (const row of logs) {
    keys.add(toDateKey(row.created_at));
  }

  return keys;
}

async function countWeeklyActivity(prisma, userId, range) {
  const [lessons, quizzes, flashcards, practiceLogs] = await Promise.all([
    prisma.user_lesson_progress.count({
      where: {
        user_id: userId,
        is_completed: true,
        last_accessed: { gte: range.start, lte: range.end },
      },
    }),
    prisma.quiz_results.count({
      where: {
        user_id: userId,
        completed_at: { gte: range.start, lte: range.end },
      },
    }),
    prisma.user_activity_log.count({
      where: {
        user_id: userId,
        activity_type: 'flashcard',
        created_at: { gte: range.start, lte: range.end },
      },
    }),
    prisma.user_activity_log.count({
      where: {
        user_id: userId,
        activity_type: 'practice',
        created_at: { gte: range.start, lte: range.end },
      },
    }),
  ]);

  return lessons + quizzes + flashcards + practiceLogs;
}

export async function getUserDashboardUseCase({ prisma, userId }) {
  const profile = await prisma.profiles.findUnique({
    where: { id: userId },
    select: {
      full_name: true,
      target_level: true,
      total_study_minutes: true,
    },
  });

  if (!profile) {
    const err = new Error('Profile not found');
    err.statusCode = 404;
    throw err;
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const activityDateKeys = await collectActivityDateKeys(prisma, userId);
  const streak = calculateStreak(activityDateKeys);

  const thisWeek = getWeekRange(0);
  const lastWeek = getWeekRange(-1);
  const [thisWeekCount, lastWeekCount] = await Promise.all([
    countWeeklyActivity(prisma, userId, thisWeek),
    countWeeklyActivity(prisma, userId, lastWeek),
  ]);
  const weeklyGrowth = calculateWeeklyGrowth(thisWeekCount, lastWeekCount);

  const totalMinutes = profile.total_study_minutes ?? 0;

  const [lessonsToday, flashcardsToday, practiceQuizzesToday, practiceLogsToday] =
    await Promise.all([
      prisma.user_lesson_progress.count({
        where: {
          user_id: userId,
          is_completed: true,
          last_accessed: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.user_activity_log.count({
        where: {
          user_id: userId,
          activity_type: 'flashcard',
          created_at: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.quiz_results.count({
        where: {
          user_id: userId,
          completed_at: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.user_activity_log.count({
        where: {
          user_id: userId,
          activity_type: 'practice',
          created_at: { gte: todayStart, lte: todayEnd },
        },
      }),
    ]);

  const practiceToday = practiceQuizzesToday + practiceLogsToday;

  return {
    user: {
      name: profile.full_name ?? 'User',
    },
    stats: {
      streak,
      target: profile.target_level ?? 'N3',
      totalHours: Math.floor(totalMinutes / 60),
      weeklyGrowth,
    },
    dailyGoals: {
      lessons: {
        completed: lessonsToday,
        target: DAILY_GOALS.lessons,
      },
      flashcards: {
        completed: flashcardsToday,
        target: DAILY_GOALS.flashcards,
      },
      practice: {
        completed: practiceToday,
        target: DAILY_GOALS.practice,
      },
    },
  };
}
