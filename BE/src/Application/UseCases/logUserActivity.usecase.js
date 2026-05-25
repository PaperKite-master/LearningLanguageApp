/**
 * Ghi nhận hoạt động học (lesson / flashcard / practice) để tính streak & daily goals.
 */
export async function logUserActivityUseCase({ prisma, userId, activityType }) {
  await prisma.user_activity_log.create({
    data: {
      user_id: userId,
      activity_type: activityType,
    },
  });
}
