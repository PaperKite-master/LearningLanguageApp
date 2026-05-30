import { QuizRepository } from '../../Domain/Interfaces/QuizRepository.js';

export class PrismaQuizRepository extends QuizRepository {
  constructor(prisma) {
    super();
    this.prisma = prisma;
  }

  async getQuizById(id) {
    return this.prisma.quizzes.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async saveResult({ userId, quizId, score, isPassed }) {
    return this.prisma.quiz_results.create({
      data: {
        user_id: userId,
        quiz_id: quizId,
        score,
        is_passed: isPassed,
      },
    });
  }
}
