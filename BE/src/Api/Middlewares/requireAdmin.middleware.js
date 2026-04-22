export async function requireAdmin(request, reply) {
  const configuredKey = process.env.ADMIN_API_KEY;
  const headerKey = request.headers['x-admin-key'];
  const headerRole = request.headers['x-role'];
  const role = Array.isArray(headerRole) ? headerRole[0] : headerRole;

  if (configuredKey) {
    if (!headerKey || headerKey !== configuredKey) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }
    return;
  }

  if (role !== 'ADMIN') {
    return reply.code(403).send({ error: 'Forbidden' });
  }
}

