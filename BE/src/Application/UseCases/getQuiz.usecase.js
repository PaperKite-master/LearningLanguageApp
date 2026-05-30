import { PrismaQuizRepository } from '../../Infrastructure/Repositories/PrismaQuizRepository.js';

export async function getQuizUseCase(prisma, quizId) {
  const quizRepo = new PrismaQuizRepository(prisma);

  const quiz = await quizRepo.getQuizById(quizId);
  if (!quiz) {
    const error = new Error('Quiz not found');
    error.statusCode = 404;
    throw error;
  }

  // We return the quiz and all questions.
  // Because it's "Cách 1", the backend handles grading, so we hide the correct answers from the frontend.
  return {
    id: quiz.id,
    title: quiz.title,
    type: quiz.type,
    passingScore: quiz.passing_score,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      questionText: q.question_text,
      questionType: q.question_type,
      options: Array.isArray(q.options) 
        ? q.options.map(opt => { 
            const { isCorrect, ...rest } = opt; 
            return rest; 
          })
        : q.options,
      explanation: q.explanation,
      order: q.order,
    })),
  };
}
