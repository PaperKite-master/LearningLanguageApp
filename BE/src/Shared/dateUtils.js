export const APP_TIMEZONE = 'Asia/Ho_Chi_Minh';

/** YYYY-MM-DD in app timezone */
export function toDateKey(date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE }).format(date);
}

export function parseDateKey(key) {
  return new Date(`${key}T12:00:00+07:00`);
}

export function addDaysToKey(key, days) {
  const d = parseDateKey(key);
  d.setUTCDate(d.getUTCDate() + days);
  return toDateKey(d);
}

/** Monday = 0 … Sunday = 6 */
export function getWeekdayIndex(date) {
  const wd = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    weekday: 'short',
  }).format(date);
  const map = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  return map[wd] ?? 0;
}

export function startOfDay(date) {
  const key = toDateKey(date);
  return new Date(`${key}T00:00:00+07:00`);
}

export function endOfDay(date) {
  const key = toDateKey(date);
  return new Date(`${key}T23:59:59.999+07:00`);
}

export function getWeekStartKey(date) {
  const key = toDateKey(date);
  const weekday = getWeekdayIndex(date);
  return addDaysToKey(key, -weekday);
}

/** @param {number} offsetWeeks 0 = current week, -1 = previous week */
export function getWeekRange(offsetWeeks = 0) {
  const now = new Date();
  const startKey = addDaysToKey(getWeekStartKey(now), offsetWeeks * 7);
  const endKey = addDaysToKey(startKey, 6);
  return {
    start: startOfDay(parseDateKey(startKey)),
    end: endOfDay(parseDateKey(endKey)),
  };
}
