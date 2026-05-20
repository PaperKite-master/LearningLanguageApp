import { AdminFlashcardRepository } from '../../Domain/Interfaces/AdminFlashcardRepository.js';

/**
 * Prisma implementation of AdminFlashcardRepository.
 * Operates on the `admin_flashcards` table (system-wide vocabulary cards).
 */
export class PrismaAdminFlashcardRepository extends AdminFlashcardRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async list({ search, page = 1, limit = 20 } = {}) {
    const where = {};

    if (search) {
      where.OR = [
        { japanese_word: { contains: search, mode: 'insensitive' } },
        { meaning_vi: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.admin_flashcards.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.admin_flashcards.count({ where })
    ]);

    return { data, total };
  }

  async findById(id) {
    return this.prisma.admin_flashcards.findUnique({
      where: { id }
    });
  }

  async create({ level, japaneseWord, pronunciation, meaningVi, status }) {
    return this.prisma.admin_flashcards.create({
      data: {
        level,
        japanese_word: japaneseWord,
        pronunciation,
        meaning_vi: meaningVi,
        status: status ?? 'DRAFT'
      }
    });
  }

  async update(id, { level, japaneseWord, pronunciation, meaningVi, status }) {
    return this.prisma.admin_flashcards.update({
      where: { id },
      data: {
        ...(level !== undefined && { level }),
        ...(japaneseWord !== undefined && { japanese_word: japaneseWord }),
        ...(pronunciation !== undefined && { pronunciation }),
        ...(meaningVi !== undefined && { meaning_vi: meaningVi }),
        ...(status !== undefined && { status })
      }
    });
  }

  async delete(id) {
    return this.prisma.admin_flashcards.delete({
      where: { id }
    });
  }
}
