export async function requireAdmin(request, reply) {
  const userId = request.user?.sub;

  if (!userId) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  const profile = await request.server.prisma.profiles.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!profile || profile.role !== 'ADMIN') {
    return reply.code(403).send({ error: 'Forbidden' });
  }
}

