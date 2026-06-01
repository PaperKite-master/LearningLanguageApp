export class PrismaLessonRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async list() {
    return this.prisma.lessons.findMany({
      where: { status: 'published' },
      orderBy: [{ order: 'asc' }, { created_at: 'asc' }]
    });
  }

  async listAll() {
    return this.prisma.lessons.findMany({
      orderBy: [{ order: 'asc' }, { created_at: 'asc' }]
    });
  }

  async findById(id) {
    return this.prisma.lessons.findFirst({
      where: { id, status: 'published' }
    });
  }

  async create({ title, timelineId, topic, status, videoUrl, contentMarkdown, order, lessonCode }) {
    const normalizedTimelineId = normalizeNullableUuid(timelineId);
    const normalizedTopic = normalizeNullableText(topic);

    return this.prisma.lessons.create({
      data: {
        title,
        timeline_id: normalizedTimelineId,
        topic: normalizedTopic,
        status: status ?? 'published',
        video_url: videoUrl ?? null,
        content_markdown: contentMarkdown ?? null,
        order: order ?? 0,
        lesson_code: lessonCode ?? null
      }
    });
  }

  async update(id, { title, timelineId, topic, status, videoUrl, contentMarkdown, order, lessonCode }) {
    const normalizedTimelineId = normalizeNullableUuid(timelineId);
    const normalizedTopic = normalizeNullableText(topic);

    return this.prisma.lessons.update({
      where: { id },
      data: {
        title,
        timeline_id: normalizedTimelineId,
        topic: normalizedTopic,
        status,
        video_url: videoUrl,
        content_markdown: contentMarkdown,
        order,
        lesson_code: lessonCode
      }
    });
  }

  async delete(id) {
    return this.prisma.lessons.delete({ where: { id } });
  }
}

function normalizeNullableUuid(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
}

function normalizeNullableText(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
}

