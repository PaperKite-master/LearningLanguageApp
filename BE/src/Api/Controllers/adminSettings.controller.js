export const adminSettingsController = {
  async getSettings(req, reply) {
    try {
      let settings = await req.server.prisma.system_settings.findUnique({
        where: { id: 'singleton' },
      });

      if (!settings) {
        settings = await req.server.prisma.system_settings.create({
          data: { id: 'singleton' },
        });
      }

      return reply.code(200).send({ data: settings });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: err.message, statusCode: 500 });
    }
  },

  async updateSettings(req, reply) {
    try {
      const { study_reminder_enabled, email_reminder_enabled } = req.body;

      const settings = await req.server.prisma.system_settings.upsert({
        where: { id: 'singleton' },
        update: {
          ...(study_reminder_enabled !== undefined && { study_reminder_enabled }),
          ...(email_reminder_enabled !== undefined && { email_reminder_enabled }),
          updated_at: new Date(),
        },
        create: {
          id: 'singleton',
          ...(study_reminder_enabled !== undefined && { study_reminder_enabled }),
          ...(email_reminder_enabled !== undefined && { email_reminder_enabled }),
        },
      });

      return reply.code(200).send({ data: settings });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({ error: err.message, statusCode: 500 });
    }
  },
};
