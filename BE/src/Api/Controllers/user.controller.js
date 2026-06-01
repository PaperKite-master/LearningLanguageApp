import { getUserDashboardUseCase } from '../../Application/UseCases/getUserDashboard.usecase.js';
import { addStudyTimeUseCase } from '../../Application/UseCases/addStudyTime.usecase.js';
import { updateProfileUseCase } from '../../Application/UseCases/updateProfile.usecase.js';

export const userController = {
  async dashboard(req, reply) {
    try {
      const data = await getUserDashboardUseCase({
        prisma: req.server.prisma,
        userId: req.user.sub,
      });

      return reply.code(200).send({ status: 'success', data });
    } catch (err) {
      req.log.error(err);
      return reply.code(err.statusCode || 500).send({
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  },

  async addStudyTime(req, reply) {
    try {
      const data = await addStudyTimeUseCase({
        prisma: req.server.prisma,
        userId: req.user.sub,
        minutes: req.body.minutes,
      });

      return reply.code(200).send({ status: 'success', data });
    } catch (err) {
      req.log.error(err);
      return reply.code(err.statusCode || 500).send({
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  },

  async updateProfile(req, reply) {
    try {
      const data = await updateProfileUseCase({
        prisma: req.server.prisma,
        userId: req.user.sub,
        ...req.body
      });

      return reply.code(200).send({ status: 'success', message: 'Profile updated successfully', data });
    } catch (err) {
      req.log.error(err);
      return reply.code(err.statusCode || 500).send({
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  },
};
