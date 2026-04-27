/**
 * Get current user profile use case.
 * req.user is populated by the authenticate middleware.
 */
export async function getProfileUseCase(prisma, userId) {
  const profile = await prisma.profiles.findUnique({
    where: { id: userId },
    select: {
      id: true,
      full_name: true,
      avatar_url: true,
      role: true,
      total_exp: true,
      updated_at: true,
    },
  });

  if (!profile) {
    const err = new Error('Profile not found');
    err.statusCode = 404;
    throw err;
  }

  return profile;
}
