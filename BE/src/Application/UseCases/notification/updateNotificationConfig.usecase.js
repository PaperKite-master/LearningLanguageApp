import { PrismaNotificationRepository } from '../../../Infrastructure/Repositories/PrismaNotificationRepository.js';

/**
 * Update (upsert) notification config for the authenticated user.
 *
 * @param {object} prisma
 * @param {string} userId
 * @param {{ is_enabled?: boolean, reminder_time?: string, timezone?: string }} body
 */
export async function updateNotificationConfigUseCase(prisma, userId, body) {
  const repo = new PrismaNotificationRepository(prisma);

  // Validate reminder_time format HH:MM if provided
  if (body.reminder_time) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(body.reminder_time)) {
      const err = new Error('reminder_time must be in HH:MM format (e.g. "08:00")');
      err.statusCode = 400;
      throw err;
    }
  }

  // Validate reminder_type and reminder_date
  if (body.reminder_type && !['DAILY', 'ONE_TIME'].includes(body.reminder_type)) {
    const err = new Error('reminder_type must be either "DAILY" or "ONE_TIME"');
    err.statusCode = 400;
    throw err;
  }
  if (body.reminder_type === 'ONE_TIME' && !body.reminder_date) {
    const err = new Error('reminder_date is required when reminder_type is "ONE_TIME"');
    err.statusCode = 400;
    throw err;
  }
  if (body.reminder_date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.reminder_date)) {
      const err = new Error('reminder_date must be in YYYY-MM-DD format (e.g. "2026-05-18")');
      err.statusCode = 400;
      throw err;
    }
  }

  const existingConfig = await repo.findByUserId(userId);
  const targetType = body.reminder_type || existingConfig?.reminder_type || 'DAILY';
  const targetDateStr = body.reminder_date || (existingConfig?.reminder_date ? existingConfig.reminder_date.toISOString().split('T')[0] : null);

  let targetTimeStr = '08:00';
  if (body.reminder_time) {
    targetTimeStr = body.reminder_time;
  } else if (existingConfig?.reminder_time) {
    const rt = existingConfig.reminder_time;
    targetTimeStr = `${String(rt.getUTCHours()).padStart(2, '0')}:${String(rt.getUTCMinutes()).padStart(2, '0')}`;
  }

  const targetTimezone = body.timezone || existingConfig?.timezone || 'Asia/Ho_Chi_Minh';

  if (targetType === 'ONE_TIME' && targetDateStr) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: targetTimezone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      });
      const parts = formatter.formatToParts(new Date());
      const p = {};
      for (const part of parts) p[part.type] = part.value;
      
      const currentStr = `${p.year}-${p.month}-${p.day} ${p.hour === '24' ? '00' : p.hour}:${p.minute}`;
      const targetStr = `${targetDateStr} ${targetTimeStr}`;
      
      if (targetStr < currentStr) {
        const err = new Error('Reminder date and time cannot be in the past');
        err.statusCode = 400;
        throw err;
      }
    } catch (e) {
      if (e.statusCode === 400) throw e;
      // Ignore Intl.DateTimeFormat errors for invalid timezones
    }
  }

  const config = await repo.upsert(userId, body);

  // Format reminder_time back to HH:MM string for the response
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
