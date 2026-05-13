export class FlashcardRepository {
  async create({ userId, frontText, backText, notes }) {
    throw new Error('Not implemented');
  }

  async listByUserId(userId) {
    throw new Error('Not implemented');
  }

  async findByIdAndUserId(id, userId) {
    throw new Error('Not implemented');
  }

  async update(id, userId, { frontText, backText, notes }) {
    throw new Error('Not implemented');
  }

  async delete(id, userId) {
    throw new Error('Not implemented');
  }
}
