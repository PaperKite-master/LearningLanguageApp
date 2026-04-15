export class PrismaLessonRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async list() {
    return this.prisma.lessons.findMany({
      orderBy: { created_at: 'desc' }
    });
  }
}

