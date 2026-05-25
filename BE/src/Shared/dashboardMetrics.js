import { addDaysToKey, toDateKey } from './dateUtils.js';

/**
 * Chuỗi ngày học liên tục.
 * Grace 1 ngày: hôm nay chưa học nhưng hôm qua có vẫn giữ streak.
 * Hụt >1 ngày → reset về 0.
 */
export function calculateStreak(activityDateKeys) {
  if (!activityDateKeys || activityDateKeys.size === 0) return 0;

  const today = toDateKey(new Date());
  const yesterday = addDaysToKey(today, -1);

  let anchor = null;
  if (activityDateKeys.has(today)) anchor = today;
  else if (activityDateKeys.has(yesterday)) anchor = yesterday;
  else return 0;

  let streak = 0;
  let cursor = anchor;
  while (activityDateKeys.has(cursor)) {
    streak += 1;
    cursor = addDaysToKey(cursor, -1);
  }

  return streak;
}

/** % tăng trưởng tuần này so với tuần trước (làm tròn integer). */
export function calculateWeeklyGrowth(thisWeekCount, lastWeekCount) {
  if (lastWeekCount === 0) {
    return thisWeekCount > 0 ? 100 : 0;
  }
  return Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100);
}
