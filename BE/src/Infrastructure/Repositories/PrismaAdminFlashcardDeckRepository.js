import { AdminFlashcardDeckRepository } from '../../Domain/Interfaces/AdminFlashcardDeckRepository.js';

export class PrismaAdminFlashcardDeckRepository extends AdminFlashcardDeckRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async list({ search, page = 1, limit = 20 } = {}) {
    const where = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.flashcard_decks.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { admin_flashcards: true }
          }
        }
      }),
      this.prisma.flashcard_decks.count({ where })
    ]);

    return { data, total };
  }

  async findById(id) {
    return this.prisma.flashcard_decks.findUnique({
      where: { id },
      include: {
        _count: {
          select: { admin_flashcards: true }
        }
      }
    });
  }

  async create({ name, description }) {
    return this.prisma.flashcard_decks.create({
      data: { name, description }
    });
  }

  async update(id, { name, description }) {
    return this.prisma.flashcard_decks.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description })
      }
    });
  }

  async delete(id) {
    return this.prisma.flashcard_decks.delete({
      where: { id }
    });
  }
}
