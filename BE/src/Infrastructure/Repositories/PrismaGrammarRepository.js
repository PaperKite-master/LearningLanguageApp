export class PrismaGrammarRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async create({ lessonId, title, contentMarkdown, order }) {
    return this.prisma.grammars.create({
      data: {
        lesson_id: lessonId,
        title,
        content_markdown: contentMarkdown ?? null,
        order: order ?? 0
      }
    });
  }

  async update(id, { lessonId, title, contentMarkdown, order }) {
    return this.prisma.grammars.update({
      where: { id },
      data: {
        lesson_id: lessonId,
        title,
        content_markdown: contentMarkdown,
        order
      }
    });
  }
}

