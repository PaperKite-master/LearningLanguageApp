import { FlashcardRepository } from '../../Domain/Interfaces/FlashcardRepository.js';

/**
 * Prisma implementation of FlashcardRepository.
 * PostgreSQL natively stores all text as Unicode (UTF-8),
 * so Kanji / Hiragana / Katakana are fully supported without extra config.
 */
export class PrismaFlashcardRepository extends FlashcardRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async create({ userId, frontText, backText, notes }) {
    return this.prisma.flashcards.create({
      data: {
        user_id: userId || null, // If userId is undefined, it becomes null (Admin card)
        front_text: frontText,
        back_text: backText,
        notes: notes ?? null
      }
    });
  }

  // Fetch admin cards (Thư viện thẻ)
  async listLibrary() {
    return this.prisma.flashcards.findMany({
      where: { user_id: null },
      orderBy: { created_at: 'desc' }
    });
  }

  // Fetch user cards (Thẻ của tôi)
  async listByUserId(userId) {
    if (!userId) throw new Error("userId is required for listByUserId");
    return this.prisma.flashcards.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
  }

  async findByIdAndUserId(id, userId) {
    return this.prisma.flashcards.findFirst({
      where: { id, user_id: userId || null }
    });
  }

  async update(id, userId, { frontText, backText, notes }) {
    // updateMany scoped to (id + user_id) prevents cross-user tampering
    const result = await this.prisma.flashcards.updateMany({
      where: { id, user_id: userId || null },
      data: {
        ...(frontText !== undefined && { front_text: frontText }),
        ...(backText !== undefined && { back_text: backText }),
        ...(notes !== undefined && { notes: notes ?? null })
      }
    });
    if (result.count === 0) return null;
    return this.findByIdAndUserId(id, userId);
  }

  async delete(id, userId) {
    const result = await this.prisma.flashcards.deleteMany({
      where: { id, user_id: userId || null }
    });
    return result.count > 0;
  }
}
