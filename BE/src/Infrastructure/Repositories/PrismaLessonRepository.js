export class PrismaLessonRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async list() {
    return this.prisma.lessons.findMany({
      orderBy: { created_at: 'desc' }
    });
  }

  async create({ title, timelineId, videoUrl, contentMarkdown, order }) {
    const normalizedTimelineId = normalizeNullableUuid(timelineId);

    return this.prisma.lessons.create({
      data: {
        title,
        timeline_id: normalizedTimelineId,
        video_url: videoUrl ?? null,
        content_markdown: contentMarkdown ?? null,
        order: order ?? 0
      }
    });
  }

  async update(id, { title, timelineId, videoUrl, contentMarkdown, order }) {
    const normalizedTimelineId = normalizeNullableUuid(timelineId);

    return this.prisma.lessons.update({
      where: { id },
      data: {
        title,
        timeline_id: normalizedTimelineId,
        video_url: videoUrl,
        content_markdown: contentMarkdown,
        order
      }
    });
  }
}

function normalizeNullableUuid(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
}

