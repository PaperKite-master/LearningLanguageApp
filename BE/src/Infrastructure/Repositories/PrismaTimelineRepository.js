export class PrismaTimelineRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async list() {
    return this.prisma.timelines.findMany({
      orderBy: [{ order: 'asc' }, { created_at: 'asc' }],
      include: {
        lessons: {
          where: { status: 'published' },
          orderBy: [{ order: 'asc' }, { created_at: 'asc' }]
        }
      }
    });
  }

  async findById(id) {
    return this.prisma.timelines.findFirst({
      where: { id },
      include: {
        lessons: {
          where: { status: 'published' },
          orderBy: [{ order: 'asc' }, { created_at: 'asc' }]
        }
      }
    });
  }

  async create({ title, description, order }) {
    const normalizedDescription = normalizeNullableText(description);

    return this.prisma.timelines.create({
      data: {
        title,
        description: normalizedDescription,
        order: order ?? 0
      },
      include: {
        lessons: {
          where: { status: 'published' },
          orderBy: [{ order: 'asc' }, { created_at: 'asc' }]
        }
      }
    });
  }

  async update(id, { title, description, order }) {
    const normalizedDescription = normalizeNullableText(description);

    return this.prisma.timelines.update({
      where: { id },
      data: {
        title,
        description: normalizedDescription,
        order
      },
      include: {
        lessons: {
          where: { status: 'published' },
          orderBy: [{ order: 'asc' }, { created_at: 'asc' }]
        }
      }
    });
  }

  async delete(id) {
    return this.prisma.timelines.delete({ where: { id } });
  }
}

function normalizeNullableText(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
}
