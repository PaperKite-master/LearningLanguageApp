import { prisma } from '../../../Infrastructure/Persistence/prisma.js';
import { APP_TIMEZONE } from '../../../Shared/dateUtils.js';

const SUCCESS_PAYMENT_STATUSES = ['SUCCESS', 'COMPLETED'];
const MONTH_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

function getMonthRange(offsetMonths = 0) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now);

  let year = Number(parts.find((part) => part.type === 'year').value);
  let month = Number(parts.find((part) => part.type === 'month').value) - 1;

  month += offsetMonths;
  while (month < 0) {
    month += 12;
    year -= 1;
  }
  while (month > 11) {
    month -= 12;
    year += 1;
  }

  const start = new Date(`${year}-${String(month + 1).padStart(2, '0')}-01T00:00:00+07:00`);
  const endMonth = month === 11 ? 0 : month + 1;
  const endYear = month === 11 ? year + 1 : year;
  const end = new Date(`${endYear}-${String(endMonth + 1).padStart(2, '0')}-01T00:00:00+07:00`);

  return { start, end, monthIndex: month };
}

function getDayRange(daysAgoStart, daysAgoEnd) {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() - daysAgoStart);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);
  start.setDate(start.getDate() - daysAgoEnd);
  start.setHours(0, 0, 0, 0);

  return { start, end };
}

function formatGrowthPercent(current, previous) {
  if (previous === 0) {
    if (current === 0) return 'Không đổi so với kỳ trước';
    return 'Mới có dữ liệu trong kỳ này';
  }

  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0) return `Tăng ${pct}% so với kỳ trước`;
  if (pct < 0) return `Giảm ${Math.abs(pct)}% so với kỳ trước`;
  return 'Không đổi so với kỳ trước';
}

function formatRevenueVnd(amount) {
  const value = Number(amount) || 0;
  if (value <= 0) return '0 ₫';
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const formatted = millions >= 10 ? Math.round(millions) : Math.round(millions * 10) / 10;
    return `${formatted}Tr ₫`;
  }
  return `${value.toLocaleString('vi-VN')} ₫`;
}

async function countNewUsersInRange(start, end) {
  return prisma.profiles.count({
    where: {
      role: 'USER',
      users: {
        created_at: {
          gte: start,
          lt: end,
        },
      },
    },
  });
}

async function sumRevenueInRange(start, end) {
  const result = await prisma.payment_transactions.aggregate({
    _sum: { amount: true },
    where: {
      status: { in: SUCCESS_PAYMENT_STATUSES },
      created_at: {
        gte: start,
        lt: end,
      },
    },
  });
  return result._sum.amount || 0;
}

async function countLearningActivityInRange(start, end) {
  const [logs, lessons, quizzes] = await Promise.all([
    prisma.user_activity_log.count({
      where: { created_at: { gte: start, lt: end } },
    }),
    prisma.user_lesson_progress.count({
      where: { last_accessed: { gte: start, lt: end } },
    }),
    prisma.quiz_results.count({
      where: { completed_at: { gte: start, lt: end } },
    }),
  ]);

  return logs + lessons + quizzes;
}

async function countActiveUsersInRange(start, end) {
  const rows = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT user_id)::int AS count
    FROM (
      SELECT user_id
      FROM public.user_activity_log
      WHERE created_at >= ${start} AND created_at < ${end}
      UNION
      SELECT user_id
      FROM public.user_lesson_progress
      WHERE last_accessed >= ${start} AND last_accessed < ${end}
      UNION
      SELECT user_id
      FROM public.quiz_results
      WHERE completed_at >= ${start} AND completed_at < ${end}
    ) AS active_users
    WHERE user_id IS NOT NULL
  `;

  return Number(rows[0]?.count ?? 0);
}

async function buildMonthlyActivityChart() {
  const ranges = Array.from({ length: 12 }, (_, index) => getMonthRange(index - 11));
  const values = await Promise.all(
    ranges.map(({ start, end }) => countLearningActivityInRange(start, end))
  );

  return ranges.map(({ monthIndex }, index) => ({
    name: MONTH_LABELS[monthIndex],
    value: values[index],
  }));
}

async function buildUserGrowthChart() {
  const ranges = Array.from({ length: 12 }, (_, index) => getMonthRange(index - 11));
  const values = await Promise.all(
    ranges.map(({ start, end }) => countNewUsersInRange(start, end))
  );

  return ranges.map(({ monthIndex }, index) => ({
    name: MONTH_LABELS[monthIndex],
    value: values[index],
  }));
}

export class GetAdminDashboardUseCase {
  async execute() {
    const thisMonth = getMonthRange(0);
    const lastMonth = getMonthRange(-1);
    const activeThisPeriod = getDayRange(0, 30);
    const activeLastPeriod = getDayRange(30, 60);

    const [
      totalUsersCount,
      newUsersThisMonth,
      newUsersLastMonth,
      activeUsersCount,
      activeUsersLastPeriod,
      totalRevenue,
      revenueThisMonth,
      revenueLastMonth,
      totalLessonsCount,
      newLessonsThisMonth,
      newLessonsLastMonth,
      publishedLessonsCount,
      completedProgress,
      inProgressProgress,
      activityChart,
      growthChart,
    ] = await Promise.all([
      prisma.profiles.count({ where: { role: 'USER' } }),
      countNewUsersInRange(thisMonth.start, thisMonth.end),
      countNewUsersInRange(lastMonth.start, lastMonth.end),
      countActiveUsersInRange(activeThisPeriod.start, activeThisPeriod.end),
      countActiveUsersInRange(activeLastPeriod.start, activeLastPeriod.end),
      prisma.payment_transactions.aggregate({
        _sum: { amount: true },
        where: { status: { in: SUCCESS_PAYMENT_STATUSES } },
      }).then((res) => res._sum.amount || 0),
      sumRevenueInRange(thisMonth.start, thisMonth.end),
      sumRevenueInRange(lastMonth.start, lastMonth.end),
      prisma.lessons.count(),
      prisma.lessons.count({
        where: { created_at: { gte: thisMonth.start, lt: thisMonth.end } },
      }),
      prisma.lessons.count({
        where: { created_at: { gte: lastMonth.start, lt: lastMonth.end } },
      }),
      prisma.lessons.count({ where: { status: 'published' } }),
      prisma.user_lesson_progress.count({ where: { is_completed: true } }),
      prisma.user_lesson_progress.count({ where: { is_completed: false } }),
      buildMonthlyActivityChart(),
      buildUserGrowthChart(),
    ]);

    const trackedProgress = completedProgress + inProgressProgress;
    const totalPossibleProgress = totalUsersCount * publishedLessonsCount;
    const notStartedEst = Math.max(0, totalPossibleProgress - trackedProgress);

    const completionData =
      trackedProgress + notStartedEst === 0
        ? [{ name: 'Chưa có dữ liệu', value: 1, color: '#cbd5e1' }]
        : [
            { name: 'Hoàn thành', value: completedProgress, color: '#0275d8' },
            { name: 'Đang học', value: inProgressProgress, color: '#e066ff' },
            { name: 'Chưa bắt đầu', value: notStartedEst, color: '#ef4444' },
          ];

    return {
      summary: {
        totalUsers: totalUsersCount.toString(),
        totalUsersGrowth: formatGrowthPercent(newUsersThisMonth, newUsersLastMonth),
        activeUsers: activeUsersCount.toString(),
        activeUsersGrowth: formatGrowthPercent(activeUsersCount, activeUsersLastPeriod),
        revenue: formatRevenueVnd(totalRevenue),
        revenueGrowth: formatGrowthPercent(revenueThisMonth, revenueLastMonth),
        totalLessons: totalLessonsCount.toString(),
        totalLessonsGrowth: formatGrowthPercent(newLessonsThisMonth, newLessonsLastMonth),
      },
      activityChart,
      completionData,
      growthChart,
    };
  }
}
