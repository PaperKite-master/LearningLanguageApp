import { PrismaQuizRepository } from '../../Infrastructure/Repositories/PrismaQuizRepository.js';

export async function submitQuizResultUseCase(prisma, userId, quizId, answers) {
  const quizRepo = new PrismaQuizRepository(prisma);

  const quiz = await quizRepo.getQuizById(quizId);
  if (!quiz) {
    const error = new Error('Quiz not found');
    error.statusCode = 404;
    throw error;
  }

  // Calculate score dynamically including sub-questions
  let correctCount = 0;
  let totalQuestionsCount = 0;

  for (const q of quiz.questions) {
    const qType = q.question_type || 'multiple_choice';
    if (qType === 'reading' || qType === 'READING') {
      totalQuestionsCount += Array.isArray(q.options) ? q.options.length : 0;
    } else {
      totalQuestionsCount += 1;
    }
  }

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
          correctCount++;
        }
      } else if (qType === 'typing' || qType === 'FILL_IN_BLANK') {
        const correctText = question.options[0]?.correctAnswer?.trim().toLowerCase() || '';
        const userText = (answer.answerText || '').trim().toLowerCase();
        if (correctText === userText) {
          isCorrect = true;
          correctCount++;
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
        if (isCorrect) correctCount++;
        detail = { correctPairs };
      } else if (qType === 'reading' || qType === 'READING') {
        const subQuestions = question.options;
        const subQuestionResults = [];
        let allSubCorrect = true;

        for (const subQ of subQuestions) {
          const userAns = (answer.readingAnswers || []).find(ua => ua.subQuestionId === subQ.id);
          const correctIdx = subQ.options.findIndex(opt => opt.isCorrect);
          const userAnsIdx = userAns ? userAns.answerIndex : -1;
          const subIsCorrect = userAnsIdx !== -1 && subQ.options[userAnsIdx]?.isCorrect === true;

          if (subIsCorrect) {
            correctCount++;
          } else {
            allSubCorrect = false;
          }

          subQuestionResults.push({
            subQuestionId: subQ.id,
            isCorrect: subIsCorrect,
            correctOptionIndex: correctIdx,
            userAnswerIndex: userAnsIdx
          });
        }

        isCorrect = allSubCorrect;
        detail = { subQuestionResults };
      } else if (qType === 'reorder' || qType === 'REORDER') {
        const correctOrder = question.options.map(opt => opt.text.trim());
        const userOrder = (answer.answerOrder || []).map(str => str.trim());
        
        let match = true;
        if (userOrder.length !== correctOrder.length) {
          match = false;
        } else {
          for (let i = 0; i < correctOrder.length; i++) {
            if (correctOrder[i] !== userOrder[i]) {
              match = false;
              break;
            }
          }
        }
        isCorrect = match;
        if (isCorrect) correctCount++;
        detail = { correctOrder };
      }
    }

    questionResults.push({
      questionId: answer.questionId,
      isCorrect,
      correctOptionIndex,
      userAnswerIndex: answer.answerIndex,
      userAnswerText: answer.answerText,
      userAnswerPairs: answer.answerPairs,
      userReadingAnswers: answer.readingAnswers,
      userAnswerOrder: answer.answerOrder,
      ...detail
    });
  }

  // Example: score is percentage (0-100)
  const score = totalQuestionsCount > 0 ? Math.round((correctCount / totalQuestionsCount) * 100) : 0;
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
    totalQuestions: totalQuestionsCount,
    completedAt: result.completed_at,
    questionResults,
  };
}
