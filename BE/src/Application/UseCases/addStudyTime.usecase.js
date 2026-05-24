export async function addStudyTimeUseCase({ prisma, userId, minutes }) {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    const err = new Error('minutes must be a positive number');
    err.statusCode = 400;
    throw err;
  }

  const updated = await prisma.profiles.update({
    where: { id: userId },
    data: {
      total_study_minutes: { increment: Math.round(minutes) },
    },
    select: { total_study_minutes: true },
  });

  return {
    totalStudyMinutes: updated.total_study_minutes ?? 0,
    totalHours: Math.floor((updated.total_study_minutes ?? 0) / 60),
  };
}
