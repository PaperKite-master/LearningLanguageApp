/**
 * Prisma repository for user_notifications_config table.
 */
export class PrismaNotificationRepository {
  /** @param {import('@prisma/client').PrismaClient} prisma */
  constructor(prisma) {
    this.prisma = prisma;
  }

  /**
   * Get notification config for a user.
   * Returns null if the user has no config yet.
   */
  async findByUserId(userId) {
    return this.prisma.user_notifications_config.findUnique({
      where: { user_id: userId },
    });
  }

  /**
   * Upsert notification config for a user.
   * @param {string} userId
   * @param {{ is_enabled?: boolean, reminder_time?: string, timezone?: string, reminder_type?: string, reminder_date?: string }} data
   *   reminder_time should be in "HH:MM" format (e.g. "08:00")
   *   reminder_date should be in "YYYY-MM-DD" format (e.g. "2026-05-18")
   */
  async upsert(userId, data) {
    // Build the reminder_time Date object from "HH:MM" string
    // Prisma expects a DateTime-compatible value for @db.Time fields.
    // We use a fixed epoch date; only the time portion matters.
    const buildTimeValue = (hhmm) => {
      if (!hhmm) return undefined;
      const [hours, minutes] = hhmm.split(':').map(Number);
      const d = new Date(0); // 1970-01-01
      d.setUTCHours(hours, minutes, 0, 0);
      return d;
    };

    const updatePayload = {};
    if (typeof data.is_enabled === 'boolean') updatePayload.is_enabled = data.is_enabled;
    if (data.timezone) updatePayload.timezone = data.timezone;
    if (data.reminder_time) updatePayload.reminder_time = buildTimeValue(data.reminder_time);
    if (data.reminder_type) updatePayload.reminder_type = data.reminder_type;
    if (data.reminder_date) updatePayload.reminder_date = new Date(data.reminder_date);

    return this.prisma.user_notifications_config.upsert({
      where: { user_id: userId },
      update: updatePayload,
      create: {
        user_id: userId,
        is_enabled: data.is_enabled ?? true,
        reminder_time: buildTimeValue(data.reminder_time ?? '08:00'),
        timezone: data.timezone ?? 'Asia/Ho_Chi_Minh',
        reminder_type: data.reminder_type ?? 'DAILY',
        reminder_date: data.reminder_date ? new Date(data.reminder_date) : null,
      },
    });
  }

  /**
   * Get all users who have notifications enabled.
   * Joins with auth.users to get email and profiles for display name.
   */
  async findAllEnabled() {
    return this.prisma.user_notifications_config.findMany({
      where: { is_enabled: true },
      include: {
        users: {
          select: {
            email: true,
            profiles: {
              select: { full_name: true },
            },
          },
        },
      },
    });
  }

  /**
   * Disable notifications for a user (used after ONE_TIME reminder is sent).
   */
  async disableNotification(userId) {
    return this.prisma.user_notifications_config.update({
      where: { user_id: userId },
      data: { is_enabled: false },
    });
  }
}
