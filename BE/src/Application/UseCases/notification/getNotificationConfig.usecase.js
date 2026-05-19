import { PrismaNotificationRepository } from '../../../Infrastructure/Repositories/PrismaNotificationRepository.js';

/**
 * Get notification config for the authenticated user.
 * If no config exists, returns sensible defaults.
 */
export async function getNotificationConfigUseCase(prisma, userId) {
  const repo = new PrismaNotificationRepository(prisma);
  const config = await repo.findByUserId(userId);

  if (!config) {
    // Return default config without persisting it
    return {
      is_enabled: false,
      reminder_time: '08:00',
      timezone: 'Asia/Ho_Chi_Minh',
      reminder_type: 'DAILY',
      reminder_date: null,
    };
  }

  // reminder_time from Prisma is a Date object (time-only); format as HH:MM
  const rt = config.reminder_time;
  const formatted = rt
    ? `${String(rt.getUTCHours()).padStart(2, '0')}:${String(rt.getUTCMinutes()).padStart(2, '0')}`
    : '08:00';

  return {
    is_enabled: config.is_enabled ?? false,
    reminder_time: formatted,
    timezone: config.timezone ?? 'Asia/Ho_Chi_Minh',
    reminder_type: config.reminder_type ?? 'DAILY',
    reminder_date: config.reminder_date ? config.reminder_date.toISOString().split('T')[0] : null,
  };
}
