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

  const questionResults = [];

  for (const answer of answers) {
    const question = quiz.questions.find(q => q.id === answer.questionId);
    let isCorrect = false;
    let correctOptionIndex = -1;
    let detail = {};

    if (question && Array.isArray(question.options)) {
      const qType = question.question_type || 'multiple_choice';

      if (qType === 'multiple_choice' || qType === 'MULTIPLE_CHOICE') {
        correctOptionIndex = question.options.findIndex(opt => opt.isCorrect);
        
        const selectedOption = question.options[answer.answerIndex];
        if (selectedOption && selectedOption.isCorrect) {
          isCorrect = true;
        }
      } else if (qType === 'typing' || qType === 'FILL_IN_BLANK') {
        const correctText = question.options[0]?.correctAnswer?.trim().toLowerCase() || '';
        const userText = (answer.answerText || '').trim().toLowerCase();
        if (correctText === userText) {
          isCorrect = true;
        }
        detail = { correctAnswer: question.options[0]?.correctAnswer };
      } else if (qType === 'matching' || qType === 'MATCHING') {
        const correctPairs = question.options;
        const userPairs = answer.answerPairs || [];
        
        let allMatch = true;
        if (userPairs.length !== correctPairs.length) {
          allMatch = false;
        } else {
          for (const correctPair of correctPairs) {
            const userPair = userPairs.find(up => up.left === correctPair.left && up.right === correctPair.right);
            if (!userPair) {
              allMatch = false;
              break;
            }
          }
        }
        isCorrect = allMatch;
        detail = { correctPairs };
      }

      if (isCorrect) correctCount++;
    }

    questionResults.push({
      questionId: answer.questionId,
      isCorrect,
      correctOptionIndex,
      userAnswerIndex: answer.answerIndex,
      userAnswerText: answer.answerText,
      userAnswerPairs: answer.answerPairs,
      ...detail
    });
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
    questionResults,
  };
}
