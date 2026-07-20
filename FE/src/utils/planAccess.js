export function hasFullTimelineAccess(role) {
  const normalized = String(role || 'USER').toUpperCase();
  return normalized === 'PRO' || normalized === 'ADMIN';
}

export function compareTimelines(a, b) {
  const orderDiff = (a.order || 0) - (b.order || 0);
  if (orderDiff !== 0) return orderDiff;

  const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  return createdA - createdB;
}

export function sortTimelines(timelines = []) {
  return [...timelines].sort(compareTimelines);
}

export function getAccessibleTimelines(timelines, userRole) {
  const sorted = sortTimelines(timelines);

  if (hasFullTimelineAccess(userRole)) {
    return sorted.map((timeline) => ({ ...timeline, isLocked: false }));
  }

  const firstTimelineId = sorted[0]?.id ?? null;

  return sorted.map((timeline) => {
    const lockedByApi = typeof timeline.isLocked === 'boolean' ? timeline.isLocked : null;
    const lockedByPlan = timeline.id !== firstTimelineId;
    return {
      ...timeline,
      isLocked: lockedByApi === true || lockedByPlan,
    };
  });
}

export function getVisibleTimelines(timelines, userRole) {
  const accessible = getAccessibleTimelines(timelines, userRole);
  if (hasFullTimelineAccess(userRole)) return accessible;
  return accessible.filter((timeline) => !timeline.isLocked);
}

export function getFirstUnlockedTimeline(timelines, userRole) {
  return getAccessibleTimelines(timelines, userRole).find((timeline) => !timeline.isLocked) ?? null;
}

export function isTimelineLocked(timeline) {
  return Boolean(timeline?.isLocked);
}
