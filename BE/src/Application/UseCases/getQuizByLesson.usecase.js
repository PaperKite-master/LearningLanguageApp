import { PrismaQuizRepository } from '../../Infrastructure/Repositories/PrismaQuizRepository.js';

export async function getQuizByLessonUseCase(prisma, lessonId) {
  const quizRepo = new PrismaQuizRepository(prisma);
  const quiz = await quizRepo.getQuizByLessonId(lessonId);
  if (!quiz || quiz.status === 'draft') {
    return null; // Return null if not found or draft
  }

  return {
    id: quiz.id,
    title: quiz.title,
    type: quiz.type,
    passingScore: quiz.passing_score,
    time_limit: quiz.time_limit,
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
