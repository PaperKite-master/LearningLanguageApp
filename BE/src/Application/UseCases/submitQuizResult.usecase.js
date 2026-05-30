import { PrismaQuizRepository } from '../../Infrastructure/Repositories/PrismaQuizRepository.js';

export async function submitQuizResultUseCase(prisma, userId, quizId, answers) {
  const quizRepo = new PrismaQuizRepository(prisma);

  const quiz = await quizRepo.getQuizById(quizId);
  if (!quiz) {
    const error = new Error('Quiz not found');
    error.statusCode = 404;
    throw error;
  }

  // Calculate score
  let correctCount = 0;
  const totalQuestions = quiz.questions.length;

  for (const answer of answers) {
    const question = quiz.questions.find(q => q.id === answer.questionId);
    if (question && Array.isArray(question.options)) {
      const selectedOption = question.options[answer.answerIndex];
      if (selectedOption && selectedOption.isCorrect) {
        correctCount++;
      }
    }
  }

  // Example: score is percentage (0-100)
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isPassed = score >= (quiz.passing_score ?? 0);

  const result = await quizRepo.saveResult({
    userId,
    quizId,
    score,
    isPassed,
  });

  return {
    id: result.id,
    userId: result.user_id,
    quizId: result.quiz_id,
    score: result.score,
    isPassed: result.is_passed,
    correctCount,
    totalQuestions,
    completedAt: result.completed_at,
  };
}
