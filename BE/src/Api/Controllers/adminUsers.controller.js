const INACTIVE_BANNED_UNTIL = new Date('2999-12-31T23:59:59.999Z');

function toAdminUserDto(row, totalLessons) {
  const completedLessons = Number(row.completed_lessons ?? 0);
  const total = Number(totalLessons ?? row.total_lessons ?? 0);
  const progress = total > 0 ? Math.round((completedLessons / total) * 100) : 0;

  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    role: row.role,
    status: row.status,
    progress,
    total_exp: row.total_exp,
    banned_until: row.banned_until,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function fetchAllAdminUsers(prisma) {
  return prisma.$queryRaw`
    WITH published_lessons AS (
      SELECT COUNT(*)::int AS total_lessons
      FROM public.lessons
      WHERE status = 'published'
    ),
    completed_progress AS (
      SELECT ulp.user_id, COUNT(*)::int AS completed_lessons
      FROM public.user_lesson_progress ulp
      INNER JOIN public.lessons l ON l.id = ulp.lesson_id
      WHERE ulp.is_completed = true
        AND l.status = 'published'
      GROUP BY ulp.user_id
    )
    SELECT
      u.id,
      u.email,
      p.full_name,
      p.avatar_url,
      p.role,
      p.total_exp,
      u.banned_until,
      u.deleted_at,
      u.created_at,
      u.updated_at,
      COALESCE(cp.completed_lessons, 0) AS completed_lessons,
      pl.total_lessons AS total_lessons,
      CASE
        WHEN u.deleted_at IS NOT NULL OR u.banned_until IS NOT NULL THEN 'INACTIVE'
        ELSE 'ACTIVE'
      END AS status
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    LEFT JOIN completed_progress cp ON cp.user_id = u.id
    CROSS JOIN published_lessons pl
    ORDER BY u.created_at DESC NULLS LAST, u.email ASC
  `;
}

async function fetchAdminUserById(prisma, userId) {
  const rows = await prisma.$queryRaw`
    WITH published_lessons AS (
      SELECT COUNT(*)::int AS total_lessons
      FROM public.lessons
      WHERE status = 'published'
    ),
    completed_progress AS (
      SELECT ulp.user_id, COUNT(*)::int AS completed_lessons
      FROM public.user_lesson_progress ulp
      INNER JOIN public.lessons l ON l.id = ulp.lesson_id
      WHERE ulp.is_completed = true
        AND l.status = 'published'
      GROUP BY ulp.user_id
    )
    SELECT
      u.id,
      u.email,
      p.full_name,
      p.avatar_url,
      p.role,
      p.total_exp,
      u.banned_until,
      u.deleted_at,
      u.created_at,
      u.updated_at,
      COALESCE(cp.completed_lessons, 0) AS completed_lessons,
      pl.total_lessons AS total_lessons,
      CASE
        WHEN u.deleted_at IS NOT NULL OR u.banned_until IS NOT NULL THEN 'INACTIVE'
        ELSE 'ACTIVE'
      END AS status
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    LEFT JOIN completed_progress cp ON cp.user_id = u.id
    CROSS JOIN published_lessons pl
    WHERE u.id = CAST(${userId} AS uuid)
  `;

  return rows[0] ?? null;
}

export const adminUsersController = {
  list: async (request, reply) => {
    try {
      const rows = await fetchAllAdminUsers(request.server.prisma);
      const users = rows.map((row) => toAdminUserDto(row, row.total_lessons));
      return reply.code(200).send({ data: users });
    } catch (err) {
      request.log.error(err);
      throw err;
    }
  },

  updateRole: async (request, reply) => {
    try {
      await request.server.prisma.profiles.update({
        where: { id: request.params.id },
        data: {
          role: request.body.role,
          updated_at: new Date()
        }
      });

      const user = await fetchAdminUserById(request.server.prisma, request.params.id);

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return reply.code(200).send({ data: toAdminUserDto(user, user.total_lessons) });
    } catch (err) {
      if (err?.code === 'P2025') {
        return reply.code(404).send({ error: 'User not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request params' });
      }
      throw err;
    }
  },

  updateStatus: async (request, reply) => {
    try {
      await request.server.prisma.users.update({
        where: { id: request.params.id },
        data: {
          banned_until: request.body.status === 'INACTIVE' ? INACTIVE_BANNED_UNTIL : null
        }
      });

      const user = await fetchAdminUserById(request.server.prisma, request.params.id);

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return reply.code(200).send({ data: toAdminUserDto(user, user.total_lessons) });
    } catch (err) {
      if (err?.code === 'P2025') {
        return reply.code(404).send({ error: 'User not found' });
      }
      if (err?.code === 'P2023') {
        return reply.code(400).send({ error: 'Invalid UUID format in request params' });
      }
      throw err;
    }
  }
};