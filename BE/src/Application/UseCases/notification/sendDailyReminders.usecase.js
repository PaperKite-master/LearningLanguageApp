import { PrismaNotificationRepository } from '../../../Infrastructure/Repositories/PrismaNotificationRepository.js';
import { sendReminderEmail } from '../../../Infrastructure/EmailService.js';

/**
 * Send daily reminder emails to all users whose reminder_time matches
 * the current time in their configured timezone.
 *
 * Called by the cron scheduler every minute.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function sendDailyRemindersUseCase(prisma) {
  const repo = new PrismaNotificationRepository(prisma);
  const configs = await repo.findAllEnabled();

  if (!configs.length) return;

  const now = new Date();
  let sent = 0;
  let errors = 0;

  for (const config of configs) {
    try {
      const { reminder_time, timezone, users } = config;
      if (!reminder_time || !users?.email) continue;

      // Get the current HH:MM and YYYY-MM-DD in the user's timezone
      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone ?? 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const parts = formatter.formatToParts(now);
      const getPart = (type) => parts.find((p) => p.type === type).value;
      const localTime = `${getPart('hour')}:${getPart('minute')}`;
      const localDateStr = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;

      // reminder_time is a Date object; extract UTC hour/minute
      const reminderHH = String(reminder_time.getUTCHours()).padStart(2, '0');
      const reminderMM = String(reminder_time.getUTCMinutes()).padStart(2, '0');
      const reminderFormatted = `${reminderHH}:${reminderMM}`;

      if (localTime !== reminderFormatted) continue;

      if (config.reminder_type === 'ONE_TIME') {
        if (!config.reminder_date) continue;
        const rDate = config.reminder_date;
        const rDateStr = `${rDate.getUTCFullYear()}-${String(rDate.getUTCMonth() + 1).padStart(2, '0')}-${String(rDate.getUTCDate()).padStart(2, '0')}`;
        
        if (localDateStr !== rDateStr) continue;
      }

      const displayName = users.profiles?.full_name ?? users.email.split('@')[0];
      await sendReminderEmail(users.email, displayName);

      console.log(`[Reminder] ✓ Sent to ${users.email} (${reminderFormatted} ${timezone})`);
      sent++;

      if (config.reminder_type === 'ONE_TIME') {
        await repo.disableNotification(config.user_id);
        console.log(`[Reminder] Disabled ONE_TIME reminder for ${users.email}`);
      }
    } catch (err) {
      console.error(`[Reminder] ✗ Failed for user ${config.user_id}:`, err.message);
      errors++;
    }
  }

  if (sent > 0 || errors > 0) {
    console.log(`[Reminder] Batch done — sent: ${sent}, errors: ${errors}`);
  }
}
