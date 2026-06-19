import { getUserDashboardUseCase } from '../../Application/UseCases/getUserDashboard.usecase.js';
import { addStudyTimeUseCase } from '../../Application/UseCases/addStudyTime.usecase.js';
import { updateProfileUseCase } from '../../Application/UseCases/updateProfile.usecase.js';
import { changePasswordUseCase } from '../../Application/UseCases/changePassword.usecase.js';
import { deleteAccountUseCase } from '../../Application/UseCases/deleteAccount.usecase.js';

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

  async changePassword(req, reply) {
    try {
      const { oldPassword, newPassword } = req.body;
      const email = req.user.email; // From JWT payload
      
      await changePasswordUseCase(email, oldPassword, newPassword);

      return reply.code(200).send({ status: 'success', message: 'Đổi mật khẩu thành công' });
    } catch (err) {
      req.log.error(err);
      return reply.code(err.statusCode || 500).send({
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  },

  async deleteAccount(req, reply) {
    try {
      const userId = req.user.sub;
      await deleteAccountUseCase(req.server.prisma, userId);

      return reply.code(200).send({ status: 'success', message: 'Tài khoản đã được xóa' });
    } catch (err) {
      req.log.error(err);
      return reply.code(err.statusCode || 500).send({
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  },
};
