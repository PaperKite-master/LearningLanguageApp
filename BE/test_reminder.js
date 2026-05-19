import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'nguyenvandung071020@gmail.com';
  const user = await prisma.users.findFirst({ where: { email } });
  if (!user) {
    console.log('User not found');
    return;
  }
  
  // Set time to 2 minutes from now in Asia/Ho_Chi_Minh
  const now = new Date();
  
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  // Add 2 minutes
  now.setMinutes(now.getMinutes() + 1);
  const parts = formatter.formatToParts(now);
  const getPart = (type) => parts.find((p) => p.type === type).value;
  const timeStr = `${getPart('hour')}:${getPart('minute')}`;
  
  const d = new Date(0);
  d.setUTCHours(parseInt(getPart('hour')), parseInt(getPart('minute')), 0, 0);

  // Set date to today
  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const dParts = dateFormatter.formatToParts(now);
  const getDPart = (type) => dParts.find((p) => p.type === type).value;
  const dateStr = `${getDPart('year')}-${getDPart('month')}-${getDPart('day')}`;
  
  await prisma.user_notifications_config.upsert({
    where: { user_id: user.id },
    update: {
      is_enabled: true,
      reminder_time: d,
      reminder_type: 'ONE_TIME',
      reminder_date: new Date(dateStr),
      timezone: 'Asia/Ho_Chi_Minh'
    },
    create: {
      user_id: user.id,
      is_enabled: true,
      reminder_time: d,
      reminder_type: 'ONE_TIME',
      reminder_date: new Date(dateStr),
      timezone: 'Asia/Ho_Chi_Minh'
    }
  });
  
  console.log(`Config updated for ${email} to trigger ONE_TIME at ${timeStr} on ${dateStr}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
