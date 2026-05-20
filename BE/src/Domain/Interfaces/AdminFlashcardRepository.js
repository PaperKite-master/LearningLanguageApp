/**
 * Abstract repository interface for admin-managed flashcards.
 * Admin operations are NOT scoped by user — they manage system-wide cards.
 */
export class AdminFlashcardRepository {
  /**
   * @param {{ search?: string, page?: number, limit?: number }} filters
   * @returns {Promise<{ data: object[], total: number }>}
   */
  async list(filters) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    throw new Error('Not implemented');
  }

  /**
   * @param {{ level: string, japanese_word: string, pronunciation: string, meaning_vi: string, status?: string }} data
   * @returns {Promise<object>}
   */
  async create(data) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} id
   * @param {object} data
   * @returns {Promise<object>}
   */
  async update(id, data) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} id
   * @returns {Promise<object>}
   */
  async delete(id) {
    throw new Error('Not implemented');
  }
}
