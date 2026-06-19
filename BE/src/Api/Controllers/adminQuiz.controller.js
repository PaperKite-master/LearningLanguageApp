export const adminQuizController = {
  async getQuizzes(req, reply) {
    try {
      // Fetch all quizzes with related questions count and results
      const quizzes = await req.server.prisma.quizzes.findMany({
        include: {
          _count: {
            select: { questions: true },
          },
          quiz_results: {
            select: { score: true, is_passed: true },
          },
        },
        orderBy: { created_at: 'desc' },
      });

      // Map data to calculate Avg Score, Pass Rate, and Attempts
      const mappedData = quizzes.map((q) => {
        let avg_score = 0;
        let pass_rate = 0;
        let attempts = 0;

        if (q.quiz_results && q.quiz_results.length > 0) {
          attempts = q.quiz_results.length;
          const totalScore = q.quiz_results.reduce((acc, curr) => acc + curr.score, 0);
          const passedCount = q.quiz_results.filter(r => r.is_passed).length;
          avg_score = Math.round(totalScore / attempts);
          pass_rate = Math.round((passedCount / attempts) * 100);
        }

        return {
          id: q.id,
          title: q.title,
          type: q.type,
          passing_score: q.passing_score,
          status: q.status,
          level: q.level,
          lesson_id: q.lesson_id,
          timeline_id: q.timeline_id,
          time_limit: q.time_limit,
          tags: q.tags || [],
          created_at: q.created_at,
          question_count: q._count.questions,
          avg_score: avg_score,
          pass_rate: pass_rate,
          attempts: attempts,
        };
      });

      return reply.code(200).send({ data: mappedData });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: err.message });
    }
  },

  async createQuiz(req, reply) {
    try {
      const data = await req.server.prisma.quizzes.create({
        data: req.body,
      });
      return reply.code(201).send({ data });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: err.message });
    }
  },

  async updateQuiz(req, reply) {
    try {
      const { id } = req.params;
      const data = await req.server.prisma.quizzes.update({
        where: { id },
        data: req.body,
      });
      return reply.code(200).send({ data });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: err.message });
    }
  },

  async deleteQuiz(req, reply) {
    try {
      const { id } = req.params;
      await req.server.prisma.quizzes.delete({
        where: { id },
      });
      return reply.code(200).send({ message: 'Deleted successfully' });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: err.message });
    }
  },

  async getQuestions(req, reply) {
    try {
      const { id } = req.params;
      const questions = await req.server.prisma.questions.findMany({
        where: { quiz_id: id },
        orderBy: { order: 'asc' },
      });
      return reply.code(200).send({ data: questions });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: err.message });
    }
  },

  async createQuestion(req, reply) {
    try {
      const { id } = req.params;
      const data = await req.server.prisma.questions.create({
        data: {
          ...req.body,
          quiz_id: id,
        },
      });
      return reply.code(201).send({ data });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: err.message });
    }
  },

  async updateQuestion(req, reply) {
    try {
      const { questionId } = req.params;
      const data = await req.server.prisma.questions.update({
        where: { id: questionId },
        data: req.body,
      });
      return reply.code(200).send({ data });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: err.message });
    }
  },

  async deleteQuestion(req, reply) {
    try {
      const { questionId } = req.params;
      await req.server.prisma.questions.delete({
        where: { id: questionId },
      });
      return reply.code(200).send({ message: 'Deleted successfully' });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: err.message });
    }
  },
};
