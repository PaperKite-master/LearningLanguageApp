export class AdminFlashcardDeckRepository {
  async list({ search, page = 1, limit = 20 } = {}) {
    throw new Error('Not implemented');
  }

  async findById(id) {
    throw new Error('Not implemented');
  }

  async create({ name, description }) {
    throw new Error('Not implemented');
  }

  async update(id, { name, description }) {
    throw new Error('Not implemented');
  }

  async delete(id) {
    throw new Error('Not implemented');
  }
}
