import { getNotificationConfigUseCase } from '../../Application/UseCases/notification/getNotificationConfig.usecase.js';
import { updateNotificationConfigUseCase } from '../../Application/UseCases/notification/updateNotificationConfig.usecase.js';
import { sendReminderEmail } from '../../Infrastructure/EmailService.js';

export const notificationController = {
  /**
   * GET /notifications/config
   * Returns the current user's notification preferences.
   */
  async getConfig(req, reply) {
    try {
      const data = await getNotificationConfigUseCase(req.server.prisma, req.user.sub);
      return reply.code(200).send({ data });
    } catch (err) {
      req.log.error(err);
      return reply.code(err.statusCode || 500).send({
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  },

  /**
   * PUT /notifications/config
   * Upserts the current user's notification preferences.
   */
  async updateConfig(req, reply) {
    try {
      const data = await updateNotificationConfigUseCase(
        req.server.prisma,
        req.user.sub,
        req.body
      );
      return reply.code(200).send({ data });
    } catch (err) {
      req.log.error(err);
      return reply.code(err.statusCode || 500).send({
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  },

  /**
   * POST /notifications/send-test
   * Immediately sends a test reminder email to the authenticated user.
   */
  async sendTest(req, reply) {
    try {
      // Get the user's email from auth.users table
      const authUser = await req.server.prisma.users.findUnique({
        where: { id: req.user.sub },
        select: {
          email: true,
          profiles: { select: { full_name: true } },
        },
      });

      if (!authUser?.email) {
        return reply.code(404).send({ error: 'User email not found', statusCode: 404 });
      }

      const displayName = authUser.profiles?.full_name ?? authUser.email.split('@')[0];
      await sendReminderEmail(authUser.email, displayName);

      return reply.code(200).send({ message: `Test email sent to ${authUser.email}` });
    } catch (err) {
      req.log.error(err);
      return reply.code(err.statusCode || 500).send({
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  },
};
