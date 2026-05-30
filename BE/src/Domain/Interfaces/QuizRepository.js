export class QuizRepository {
  /**
   * Retrieves a quiz and all its questions by Quiz ID.
   * @param {string} id
   */
  async getQuizById(id) {
    throw new Error('Method not implemented.');
  }

  /**
   * Saves the result of a quiz taken by a user.
   * @param {Object} data
   * @param {string} data.userId
   * @param {string} data.quizId
   * @param {number} data.score
   * @param {boolean} data.isPassed
   */
  async saveResult(data) {
    throw new Error('Method not implemented.');
  }
}
