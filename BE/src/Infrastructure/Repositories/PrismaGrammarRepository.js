export class PrismaGrammarRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async listAll() {
    return this.prisma.grammars.findMany({
      orderBy: [{ created_at: 'desc' }]
    });
  }

  async listByLessonId(lessonId) {
    return this.prisma.grammars.findMany({
      where: {
        lesson_id: lessonId,
        status: 'published',
        lessons: {
          status: 'published'
        }
      },
      orderBy: [{ order: 'asc' }, { created_at: 'asc' }]
    });
  }

  async create({ lessonId, title, contentMarkdown, order, status }) {
    return this.prisma.grammars.create({
      data: {
        lesson_id: lessonId,
        title,
        content_markdown: contentMarkdown ?? null,
        order: order ?? 0,
        status: status ?? 'published'
      }
    });
  }

  async update(id, { lessonId, title, contentMarkdown, order, status }) {
    const data = {};
    if (lessonId !== undefined) data.lesson_id = lessonId;
    if (title !== undefined) data.title = title;
    if (contentMarkdown !== undefined) data.content_markdown = contentMarkdown;
    if (order !== undefined) data.order = order;
    if (status !== undefined) data.status = status;

    return this.prisma.grammars.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return this.prisma.grammars.delete({ where: { id } });
  }
}

