const FULL_ACCESS_ROLES = new Set(['PRO', 'ADMIN']);

export function hasFullTimelineAccess(role) {
  return FULL_ACCESS_ROLES.has(String(role || 'USER').toUpperCase());
}

export async function getFirstTimelineId(prisma) {
  const firstTimeline = await prisma.timelines.findFirst({
    orderBy: [{ order: 'asc' }, { created_at: 'asc' }],
    select: { id: true },
  });
  return firstTimeline?.id ?? null;
}

export async function getUserRole(prisma, userId) {
  if (!userId) return 'USER';
  const profile = await prisma.profiles.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return profile?.role ?? 'USER';
}

export async function isTimelineAccessible(prisma, timelineId, role) {
  if (!timelineId) return true;
  if (hasFullTimelineAccess(role)) return true;
  const firstTimelineId = await getFirstTimelineId(prisma);
  return timelineId === firstTimelineId;
}

export async function assertTimelineAccessible(prisma, timelineId, role) {
  const allowed = await isTimelineAccessible(prisma, timelineId, role);
  if (!allowed) {
    const error = new Error('Nội dung này yêu cầu gói PRO');
    error.statusCode = 403;
    throw error;
  }
}

export async function assertLessonAccessible(prisma, lessonId, role) {
  const lesson = await prisma.lessons.findUnique({
    where: { id: lessonId },
    select: { timeline_id: true },
  });
  if (!lesson) {
    const error = new Error('Lesson not found');
    error.statusCode = 404;
    throw error;
  }
  await assertTimelineAccessible(prisma, lesson.timeline_id, role);
}

export function withTimelineLockFlags(timelines, role) {
  if (hasFullTimelineAccess(role)) {
    return timelines.map((timeline) => ({ ...timeline, isLocked: false }));
  }

  const sorted = [...timelines].sort((a, b) => {
    const orderDiff = (a.order || 0) - (b.order || 0);
    if (orderDiff !== 0) return orderDiff;
    const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return createdA - createdB;
  });

  const firstTimelineId = sorted[0]?.id ?? null;

  return timelines.map((timeline) => ({
    ...timeline,
    isLocked: timeline.id !== firstTimelineId,
  }));
}
