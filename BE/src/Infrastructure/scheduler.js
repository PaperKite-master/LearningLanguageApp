import cron from 'node-cron';
import { sendDailyRemindersUseCase } from '../Application/UseCases/notification/sendDailyReminders.usecase.js';

/**
 * Start the cron scheduler.
 * Runs every minute and dispatches reminder emails when a user's
 * configured reminder_time matches the current local time in their timezone.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export function startScheduler(prisma) {
  // '* * * * *' = every minute
  cron.schedule('* * * * *', async () => {
    try {
      await sendDailyRemindersUseCase(prisma);
    } catch (err) {
      console.error('[Scheduler] Unexpected error in sendDailyReminders:', err);
    }
  });

  console.log('[Scheduler] Daily reminder cron started (every minute) ✓');
}
