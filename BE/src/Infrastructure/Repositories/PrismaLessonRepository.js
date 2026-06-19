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

  async listAllWithStats() {
    return this.prisma.lessons.findMany({
      include: {
        _count: {
          select: { user_lesson_progress: true }
        },
        user_lesson_progress: {
          where: { is_completed: true },
          select: { id: true }
        },
        vocabulary: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: [{ order: 'asc' }, { created_at: 'asc' }]
    });
  }

  async findById(id) {
    return this.prisma.lessons.findFirst({
      where: { id, status: 'published' },
      include: {
        vocabulary: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    });
  }

  async create({ title, timelineId, topic, status, videoUrl, contentMarkdown, order, lessonCode, vocabularies }) {
    const normalizedTimelineId = normalizeNullableUuid(timelineId);
    const normalizedTopic = normalizeNullableText(topic);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create lesson
      const lesson = await tx.lessons.create({
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

      // 2. Handle vocabularies and questions
      if (vocabularies && vocabularies.length > 0) {
        let quiz = null;
        const allQuestions = vocabularies.flatMap(v => v.questions || []);
        
        if (allQuestions.length > 0) {
          quiz = await tx.quizzes.create({
            data: {
              lesson_id: lesson.id,
              title: `Quiz: ${lesson.title}`,
              type: 'VOCABULARY',
              status: 'published'
            }
          });
        }

        for (const vocab of vocabularies) {
          const createdVocab = await tx.vocabulary.create({
            data: {
              lesson_id: lesson.id,
              hiragana: vocab.hiragana,
              romaji: vocab.romaji ?? null,
              kanji: vocab.kanji ?? null,
              meaning: vocab.meaning
            }
          });

          if (vocab.questions && vocab.questions.length > 0 && quiz) {
            await tx.questions.createMany({
              data: vocab.questions.map((q, idx) => ({
                quiz_id: quiz.id,
                vocabulary_id: createdVocab.id,
                question_text: q.question_text,
                question_type: q.question_type ?? 'multiple_choice',
                options: q.options ? q.options : [],
                explanation: q.explanation ?? null,
                order: idx
              }))
            });
          }
        }
      }

      return lesson;
    });
  }

  async update(id, { title, timelineId, topic, status, videoUrl, contentMarkdown, order, lessonCode, vocabularies }) {
    const normalizedTimelineId = normalizeNullableUuid(timelineId);
    const normalizedTopic = normalizeNullableText(topic);

    return this.prisma.$transaction(async (tx) => {
      // 1. Update lesson
      const lesson = await tx.lessons.update({
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

      // 2. Sync vocabularies if provided
      if (vocabularies !== undefined) {
        // Delete old vocabularies
        await tx.vocabulary.deleteMany({ where: { lesson_id: id } });
        
        let quiz = await tx.quizzes.findFirst({ where: { lesson_id: id, type: 'VOCABULARY' } });
        
        const allQuestions = vocabularies.flatMap(v => v.questions || []);
        
        if (allQuestions.length > 0) {
          if (!quiz) {
            quiz = await tx.quizzes.create({
              data: {
                lesson_id: id,
                title: `Quiz: ${lesson.title}`,
                type: 'VOCABULARY',
                status: 'published'
              }
            });
          } else {
            // Clear old questions
            await tx.questions.deleteMany({ where: { quiz_id: quiz.id } });
          }
        } else if (quiz) {
          // No questions now, delete existing quiz
          await tx.quizzes.delete({ where: { id: quiz.id } });
          quiz = null;
        }

        if (vocabularies.length > 0) {
          for (const vocab of vocabularies) {
            const createdVocab = await tx.vocabulary.create({
              data: {
                lesson_id: id,
                hiragana: vocab.hiragana,
                romaji: vocab.romaji ?? null,
                kanji: vocab.kanji ?? null,
                meaning: vocab.meaning
              }
            });

            if (vocab.questions && vocab.questions.length > 0 && quiz) {
              await tx.questions.createMany({
                data: vocab.questions.map((q, idx) => ({
                  quiz_id: quiz.id,
                  vocabulary_id: createdVocab.id,
                  question_text: q.question_text,
                  question_type: q.question_type ?? 'multiple_choice',
                  options: q.options ? q.options : [],
                  explanation: q.explanation ?? null,
                  order: idx
                }))
              });
            }
          }
        }
      }

      return lesson;
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

